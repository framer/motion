import sync, { cancelSync } from "framesync"
import { pipe } from "popmotion"
import { eachAxis } from "../utils/each-axis"
import { copyAxisBox, delta } from "../utils/geometry"
import { removeBoxTransforms } from "../utils/geometry/delta-apply"
import { isRefObject } from "../utils/is-ref-object"
import { SubscriptionManager } from "../utils/subscription-manager"
import { motionValue, MotionValue } from "../value"
import {
    buildLayoutProjectionTransformOrigin,
    identityProjection,
} from "./dom/utils/build-transform"
import {
    ResolvedValues,
    VisualElement,
    InitialVisualElementOptions,
    VisualElementOptions,
    VisualElementConfig,
    MotionPoint,
} from "./types"
import {
    initProjection,
    updateLayoutDeltas,
    updateTransformDeltas,
} from "./utils/projection"

export const visualElement = <Instance, MutableState, Options>({
    initMutableState,
    build,
    measureViewportBox,
    render,
    readNativeValue,
    resetTransform,
    restoreTransform,
    removeValueFromMutableState,
}: VisualElementConfig<Instance, MutableState, Options>) => ({
    parent,
    ref: externalRef,
    ...initialOptions
}: InitialVisualElementOptions<Instance, Options> = {}) => {
    let instance: Instance
    const mutableState = initMutableState()
    let projectionTargetProgress: MotionPoint
    let options = initialOptions

    /**
     * Keep track of whether the viewport box has been updated since the last render.
     * If it has, we want to fire the onViewportBoxUpdate listener.
     */
    let hasViewportBoxUpdated = false

    /**
     * The computed transform string to apply deltaFinal to the element. Currently this is only
     * being used to diff and decide whether to render on the current frame, but a minor optimisation
     * could be to provide this to the buildHTMLStyle function.
     */
    let prevDeltaTransform = identityProjection

    const projection = initProjection()
    const children = new Set<VisualElement>()
    const values = new Map<string, MotionValue>()
    const valueSubscriptions = new Map<string, () => void>()
    const renderSubscriptions = new SubscriptionManager()
    const latest: ResolvedValues = {}

    function update() {}

    function onRender() {
        updateTransformDeltas(latest, projection)
        build(latest, mutableState, projection, options)
        render(instance, mutableState)
        // renderSubscriptions.notify()
    }

    function subscribeToValue(key: string, value: MotionValue) {
        valueSubscriptions.set(
            key,
            pipe(
                value.onChange((latestValue: string | number) => {
                    latest[key] = latestValue

                    // if theres an onUpdate listener, fire it
                    // sync.update(, false, true) - fire onUpdate listener with latest
                }),
                value.onRenderRequest(element.scheduleRender)
            )
        )
    }

    const scheduleUpdateLayoutProjection = parent
        ? parent.scheduleUpdateLayoutProjection
        : () => sync.preRender(element.updateLayoutProjection, false, true)

    const element: VisualElement<Instance, Options> = {
        current: null,
        depth: parent ? parent.depth + 1 : 0,
        path: parent ? [...parent.path, parent] : [],

        isVisible: true,

        show() {
            if (!element.isVisible) {
                element.isVisible = true
                element.scheduleRender()
            }
        },

        hide() {
            if (element.isVisible) {
                element.isVisible = false
                element.scheduleRender()
            }
        },

        addChild: (child) => {
            children.add(child)
            return () => children.delete(child)
        },

        getInstance: () => instance,

        setStaticValue: (key, value) => (latest[key] = value),

        isHoverEventsEnabled: false,

        /**
         * Temporarily suspend hover events while we remove transforms in order to measure the layout.
         *
         * This seems like an odd bit of scheduling but what we're doing is saying after
         * the next render, wait 10 milliseconds before reenabling hover events. Waiting until
         * the next frame results in missed, valid hover events. But triggering on the postRender
         * frame is too soon to avoid triggering events with layout measurements.
         *
         * Note: If we figure out a way of measuring layout while transforms remain applied, this can be removed.
         */
        suspendHoverEvents() {
            element.isHoverEventsEnabled = false
            sync.postRender(() =>
                setTimeout(() => (element.isHoverEventsEnabled = true), 10)
            )
        },

        /**
         * Motion values
         */

        addValue(key, value) {
            // Remove existing value
            if (element.hasValue(key)) element.removeValue(key)

            values.set(key, value)
            latest[key] = value.get()
            subscribeToValue(key, value)
        },

        removeValue(key) {
            values.delete(key)
            valueSubscriptions.get(key)?.()
            valueSubscriptions.delete(key)
            delete latest[key]
            removeValueFromMutableState(key, mutableState)
        },

        hasValue: (key) => values.has(key),

        getValue(key: string, defaultValue?: string | number) {
            let value = values.get(key)

            if (value === undefined && defaultValue !== undefined) {
                value = motionValue(defaultValue)
                element.addValue(key, value)
            }

            return value as MotionValue
        },

        forEachValue: (callback) => values.forEach(callback),

        readValue: (key: string) => readNativeValue(instance, key),

        /**
         * Lifecycles
         */

        ref: (mountingElement: E) => {
            instance = element.current = mountingElement
            if (mountingElement) {
            } else {
                // TODO: Remove from attached projection here, perhaps add snapshot if this is
                // a shared projection
                // element.style.forEachValue((_, key) => element.remove)
                element.stopLayoutAnimation()
                cancelSync.update(update)
                cancelSync.render(render)
                removeFromParent?.()
            }

            if (!externalRef) return
            if (typeof externalRef === "function") {
                externalRef(mountingElement)
            } else if (isRefObject(externalRef)) {
                externalRef.current = mountingElement
            }
        },

        notifyAnimationStart() {
            return options.onAnimationStart?.()
        },

        notifyAnimationComplete() {
            return instance && options.onAnimationComplete?.()
        },

        scheduleRender() {
            sync.render(onRender, false, true)
        },

        /**
         * Options
         */

        updateOptions(newOptions) {
            options = { ...newOptions }
        },

        getVariant: (name: string) => options.variants?.[name],

        getVariantData: () => options.variantData,

        getDefaultTransition: () => options.defaultTransition,

        /**
         * Layout projection
         */
        enableLayoutProjection() {
            projection.isEnabled = true
        },

        lockProjectionTarget() {
            projection.isTargetLocked = true
        },

        unlockProjectionTarget() {
            element.stopLayoutAnimation()
            projection.isTargetLocked = false
        },

        getProjectionTarget: () => projection.target,

        startLayoutAnimation(axis, transition) {
            const progress = element.getProjectionAnimationProgress()[axis]
            const { min, max } = projection.target[axis]
            const length = max - min

            progress.clearListeners()
            progress.set(min)
            progress.set(min) // Set twice to hard-reset velocity
            progress.onChange((v) =>
                element.setProjectionTargetAxis(axis, v, v + length)
            )

            return this.animateMotionValue?.(axis, progress, 0, transition)
        },

        stopLayoutAnimation() {
            eachAxis((axis) =>
                element.getProjectionAnimationProgress()[axis].stop()
            )
        },

        measureViewportBox(withTransform = true) {
            const viewportBox = measureViewportBox(instance, options)
            if (!withTransform) removeBoxTransforms(viewportBox, latest)
            return viewportBox
        },

        updateLayoutMeasurement() {
            projection.layout = element.measureViewportBox()
            projection.layoutCorrected = copyAxisBox(projection.layout)

            // if (!this.targetBox) this.targetBox = copyAxisBox(this.box)

            // this.layoutMeasureListeners.notify(
            //     this.box,
            //     this.prevViewportBox || this.box
            // )

            sync.update(() => element.rebaseProjectionTarget())
        },

        getMeasuredLayout: () => projection.layout,

        getProjectionAnimationProgress() {
            if (!projectionTargetProgress) {
                projectionTargetProgress = {
                    x: motionValue(0),
                    y: motionValue(0),
                }
            }

            return projectionTargetProgress as MotionPoint
        },

        setProjectionTargetAxis(axis, min, max) {
            const target = projection.target[axis]
            target.min = min
            target.max = max

            // Flag that we want to fire the onViewportBoxUpdate event handler
            hasViewportBoxUpdated = true

            scheduleUpdateLayoutProjection()
        },

        rebaseProjectionTarget(force, box = projection.layout) {
            const { x, y } = element.getProjectionAnimationProgress()

            const shouldRebase =
                !projection.isTargetLocked &&
                !x.isAnimating() &&
                !y.isAnimating()

            if (force || shouldRebase) {
                eachAxis((axis) => {
                    const { min, max } = box[axis]
                    element.setProjectionTargetAxis(axis, min, max)
                })
            }
        },

        withoutTransform(callback) {
            if (projection.isEnabled) resetTransform(element, instance, options)

            parent ? parent.withoutTransform(callback) : callback()

            if (projection.isEnabled) restoreTransform(instance, mutableState)
        },

        updateLayoutProjection() {
            const { treeScale, isEnabled } = projection

            if (isEnabled) {
                const prevTreeScaleX = treeScale.x
                const prevTreeScaleY = treeScale.y

                updateLayoutDeltas(projection, element.path)

                // hasViewportBoxUpdated && viewportBoxUpdateListeners.notify(projection)
                hasViewportBoxUpdated = false

                /**
                 * Ensure this element renders on the next frame if the projection
                 * transform has changed
                 */
                const deltaTransform = buildLayoutProjectionTransformOrigin(
                    projection
                )

                if (
                    deltaTransform !== prevDeltaTransform ||
                    // Also compare calculated treeScale, for values that rely on this only for scale correction
                    prevTreeScaleX !== treeScale.x ||
                    prevTreeScaleY !== treeScale.y
                ) {
                    element.scheduleRender()
                }
                prevDeltaTransform = deltaTransform
            }

            // TODO: Currently we iterate over the tree, explore iterating over a flat set in the root node
            children.forEach(fireUpdateLayoutProjection)
        },

        syncRender: onRender,
    }

    const removeFromParent = parent?.addChild(element)

    return element
}

function fireUpdateLayoutProjection(child: VisualElement) {
    child.updateLayoutProjection()
}
