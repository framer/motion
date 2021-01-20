import sync, { cancelSync } from "framesync"
import { pipe } from "popmotion"
import {
    AnimationControls,
    isAnimationControls,
} from "../animation/AnimationControls"
import {
    Presence,
    SharedLayoutAnimationConfig,
} from "../components/AnimateSharedLayout/types"
import { MotionProps } from "../motion/types"
import { isForcedMotionValue } from "../motion/utils/use-motion-values"
import { TargetAndTransition, TargetResolver } from "../types"
import { AxisBox2D } from "../types/geometry"
import { eachAxis } from "../utils/each-axis"
import { copyAxisBox } from "../utils/geometry"
import { removeBoxTransforms } from "../utils/geometry/delta-apply"
import { isRefObject } from "../utils/is-ref-object"
import { SubscriptionManager } from "../utils/subscription-manager"
import { motionValue, MotionValue } from "../value"
import { isMotionValue } from "../value/utils/is-motion-value"
import {
    buildLayoutProjectionTransformOrigin,
    identityProjection,
} from "./dom/utils/build-transform"
import {
    ResolvedValues,
    VisualElement,
    VisualElementConfig,
    MotionPoint,
    VisualElementOptions,
} from "./types"
import { variantPriorityOrder } from "./utils/animation-state"
import {
    initProjection,
    updateLayoutDeltas,
    updateTransformDeltas,
} from "./utils/projection"
import { isVariantLabel } from "./utils/variants"

export const visualElement = <Instance, MutableState, Options>({
    initMutableState,
    build,
    makeTargetAnimatable,
    measureViewportBox,
    render,
    readNativeValue,
    resetTransform,
    restoreTransform,
    removeValueFromMutableState,
}: VisualElementConfig<Instance, MutableState, Options>) => (
    {
        parent,
        ref: externalRef,
        props,
        blockInitialAnimation,
    }: VisualElementOptions<Instance>,
    options: Options
) => {
    let instance: Instance
    const mutableState = initMutableState()
    let projectionTargetProgress: MotionPoint

    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = Boolean(isControllingVariants || props.variants)

    // TODO See if we can ditch
    const baseTarget: { [key: string]: string | number | null } = {}

    /**
     * Keep track of whether the viewport box has been updated since the last render.
     * If it has, we want to fire the onViewportBoxUpdate listener.
     */
    let hasViewportBoxUpdated = false

    let prevViewportBox: AxisBox2D

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
    // const renderSubscriptions = new SubscriptionManager()
    const layoutUpdateListeners = new SubscriptionManager()
    const layoutMeasureListeners = new SubscriptionManager()
    const viewportBoxUpdateListeners = new SubscriptionManager()
    const latest = getInitialStaticValues(props, parent, blockInitialAnimation)

    function onUpdate() {
        props.onUpdate?.(latest)
    }

    function onRender() {
        if (!instance) return
        updateTransformDeltas(latest, projection)
        build(latest, mutableState, projection, options)
        render(instance, mutableState)
        // renderSubscriptions.notify()
    }

    function subscribeToValue(key: string, value: MotionValue) {
        valueSubscriptions.set(
            key,
            (pipe as any)(
                value.onChange((latestValue: string | number) => {
                    latest[key] = latestValue

                    props.onUpdate && sync.update(onUpdate, false, true)
                }),
                value.onRenderRequest(element.scheduleRender)
            )
        )
    }

    const element: VisualElement<Instance, Options> = {
        current: null,
        depth: parent ? parent.depth + 1 : 0,
        path: parent ? [...parent.path, parent] : [],

        variantChildren: isVariantNode ? new Set() : undefined,
        subscribeToVariantParent() {
            if (!isVariantNode) return
        },

        isVisible: true,
        manuallyAnimateOnMount: false,

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

        scheduleUpdateLayoutProjection: parent
            ? parent.scheduleUpdateLayoutProjection
            : () => sync.preRender(element.updateLayoutProjection, false, true),

        getInstance: () => instance,

        getStaticValue: (key) => latest[key],
        setStaticValue: (key, value) => (latest[key] = value),
        getLatestValues: () => latest,

        isHoverEventsEnabled: false,

        makeTargetAnimatable(target, canMutate = true) {
            return makeTargetAnimatable(element, target, props, canMutate)
        },

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

        readValue: (key: string) => readNativeValue(instance, key, options),

        setBaseTarget: (key, value) => (baseTarget[key] = value),

        getBaseTarget: (key) => baseTarget[key],

        /**
         * Lifecycles
         */

        ref: (mountingElement: any) => {
            instance = element.current = mountingElement
            if (mountingElement) {
            } else {
                // TODO: Remove from attached projection here, perhaps add snapshot if this is
                // a shared projection
                // element.style.forEachValue((_, key) => element.remove)
                element.stopLayoutAnimation()
                cancelSync.update(onUpdate)
                cancelSync.render(onRender)
                removeFromParent?.()
            }

            if (!externalRef) return
            if (typeof externalRef === "function") {
                externalRef(mountingElement)
            } else if (isRefObject(externalRef)) {
                ;(externalRef as any).current = mountingElement
            }
        },

        notifyAnimationStart() {
            return props.onAnimationStart?.()
        },

        notifyAnimationComplete() {
            return instance && props.onAnimationComplete?.()
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

        updateProps(newProps) {
            props = newProps
        },

        getVariant: (name) => props.variants?.[name],

        getVariantData: () => props.custom,

        getDefaultTransition: () => props.transition,

        getVariantContext(startAtParent = false) {
            if (startAtParent) return parent?.getVariantContext()

            if (!isControllingVariants) {
                return parent?.getVariantContext()
            }

            const context = {}
            for (let i = 0; i < numVariantProps; i++) {
                const name = variantProps[i]
                const prop = props[name]

                if (isVariantLabel(prop) || prop === false) {
                    context[name] = prop
                }
            }

            return context
        },

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

        /**
         * Record the viewport box as it was before an expected mutation/re-render
         */
        snapshotViewportBox() {
            prevViewportBox = element.measureViewportBox(false)

            /**
             * Update targetBox to match the prevViewportBox. This is just to ensure
             * that targetBox is affected by scroll in the same way as the measured box
             */
            element.rebaseProjectionTarget(false, prevViewportBox)
        },

        // TODO Replace other projection getters with this
        getProjection: () => projection,

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

            // TODO: This is loaded in by Animate.tsx
            return (element as any).animateMotionValue?.(
                axis,
                progress,
                0,
                transition
            )
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

            element.scheduleUpdateLayoutProjection()
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

        notifyLayoutReady(config) {
            layoutUpdateListeners.notify(
                projection.layout,
                prevViewportBox || projection.layout,
                config
            )
        },

        onLayoutUpdate(callback) {
            return layoutUpdateListeners.add(callback)
        },

        onLayoutMeasure(callback) {
            return layoutMeasureListeners.add(callback)
        },

        onViewportBoxUpdate(callback) {
            return viewportBoxUpdateListeners.add(callback)
        },

        resetTransform: () => resetTransform(element, instance, options),

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

                hasViewportBoxUpdated &&
                    viewportBoxUpdateListeners.notify(projection)
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

        // TODO: Remove this
        isPresent: true,
        presence: Presence.Entering,

        syncRender: onRender,
    }

    const removeFromParent = parent?.addChild(element)

    return element
}

function fireUpdateLayoutProjection(child: VisualElement) {
    child.updateLayoutProjection()
}

function getInitialStaticValues(
    props: MotionProps,
    parent?: VisualElement,
    blockInitialAnimation?: boolean
) {
    const { style } = props
    const values: ResolvedValues = {}

    for (const key in style) {
        if (isMotionValue(style[key])) {
            values[key] = style[key].get()
        } else if (isForcedMotionValue(key, props)) {
            values[key] = style[key]
        }
    }

    let { initial, animate } = props
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = isControllingVariants || props.variants

    if (isVariantNode && !isControllingVariants && props.inherit !== false) {
        const context = parent?.getVariantContext()
        if (context) {
            initial ??= context.initial
            animate ??= context.animate
        }
    }

    const initialToSet =
        blockInitialAnimation || initial === false ? animate : initial

    if (
        initialToSet &&
        typeof initialToSet !== "boolean" &&
        !isAnimationControls(initialToSet)
    ) {
        const list = Array.isArray(initialToSet) ? initialToSet : [initialToSet]
        list.forEach((definition) => {
            const resolved = resolveVariant(props, definition)
            if (!resolved) return

            const { transitionEnd, transition, ...target } = resolved

            for (const key in target) {
                values[key] = target[key]
            }
        })
    }

    return values
}

const variantProps = ["initial", ...variantPriorityOrder]
const numVariantProps = variantProps.length
function resolveVariant(
    props: MotionProps,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any
) {
    if (typeof definition === "string") {
        definition = props.variants?.[definition]
    }

    return typeof definition === "function"
        ? definition(custom ?? props.custom, {}, {})
        : definition
}

function checkIfControllingVariants(props: MotionProps) {
    return (
        typeof (props.animate as AnimationControls)?.start === "function" ||
        isVariantLabel(props.animate) ||
        isVariantLabel(props.whileHover) ||
        isVariantLabel(props.whileDrag) ||
        isVariantLabel(props.whileTap) ||
        isVariantLabel(props.whileFocus) ||
        isVariantLabel(props.exit) ||
        isVariantLabel(props.initial)
    )
}

export type LayoutUpdateHandler = (
    layout: AxisBox2D,
    prev: AxisBox2D,
    config?: SharedLayoutAnimationConfig
) => void
