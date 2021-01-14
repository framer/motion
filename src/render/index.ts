import sync, { cancelSync } from "framesync"
import { pipe } from "popmotion"
import { delta } from "../utils/geometry"
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
} from "./types"
import {
    initProjection,
    updateLayoutDeltas,
    updateTransformDeltas,
} from "./utils/projection"

export const visualElement = <E, MutableState>({
    initMutableState,
    build,
    render,
    readNativeValue,
    resetTransform,
    restoreTransform,
    onRemoveValue,
}: VisualElementConfig<E, MutableState>) => ({
    parent,
    ref: externalRef,
    ...initialOptions
}: InitialVisualElementOptions) => {
    let instance: E
    let mutableState = initMutableState()
    let options: VisualElementOptions = initialOptions

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

    const element: VisualElement = {
        current: null,
        depth: parent ? parent.depth + 1 : 0,
        path: parent ? [...parent.path, parent] : [],

        addChild: (child) => {
            children.add(child)
            return () => children.delete(child)
        },
        getInstance: () => instance,

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
            onRemoveValue(key, mutableState)
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

        getVariant(name: string) {
            return options.variants?.[name]
        },

        getVariantData() {
            return options.variantData
        },

        /**
         * Layout projection
         */
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
    }

    const removeFromParent = parent?.addChild(element)

    return element
}

function fireUpdateLayoutProjection(child: VisualElement) {
    child.updateLayoutProjection()
}
