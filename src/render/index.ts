import sync, { cancelSync } from "framesync"
import { pipe } from "popmotion"
import { Presence } from "../components/AnimateSharedLayout/types"
import { CrossfadeState } from "../components/AnimateSharedLayout/utils/stack"
import { MotionStyle } from "../motion/types"
import { eachAxis } from "../utils/each-axis"
import { copyAxisBox } from "../utils/geometry"
import {
    applyBoxTransforms,
    removeBoxTransforms,
} from "../utils/geometry/delta-apply"
import { updateBoxDelta } from "../utils/geometry/delta-calc"
import { isRefObject } from "../utils/is-ref-object"
import { motionValue, MotionValue } from "../value"
import { isMotionValue } from "../value/utils/is-motion-value"
import { buildLayoutProjectionTransform } from "./dom/utils/build-transform"
import {
    VisualElement,
    VisualElementConfig,
    MotionPoint,
    VisualElementOptions,
} from "./types"
import { variantPriorityOrder } from "./utils/animation-state"
import { createLifecycles } from "./utils/lifecycles"
import { updateMotionValuesFromProps } from "./utils/motion-values"
import { updateLayoutDeltas } from "./utils/projection"
import { createLayoutState, createVisualState } from "./utils/state"
import { checkIfControllingVariants, isVariantLabel } from "./utils/variants"

export const visualElement = <Instance, MutableState, Options>({
    createRenderState,
    build,
    getBaseTarget,
    makeTargetAnimatable,
    measureViewportBox,
    onMount,
    render: renderInstance,
    readValueFromInstance,
    resetTransform,
    restoreTransform,
    removeValueFromMutableState,
    scrapeMotionValuesFromProps,
}: VisualElementConfig<Instance, MutableState, Options>) => (
    {
        parent,
        variantParent,
        ref: externalRef,
        props,
        isStatic,
        snapshot,
        presenceId,
        blockInitialAnimation,
    }: VisualElementOptions<Instance>,
    options: Options
) => {
    /**
     * The instance of the render-specific node that will be hydrated by the
     * exposed React ref. So for example, this visual element can host a
     * HTMLElement, plain object, or Three.js object. The functions provided
     * in VisualElementConfig allow us to interface with this instance.
     */
    let instance: Instance

    /**
     * A set of all children of this visual element. We use this to traverse
     * the tree when updating layout projections.
     */
    const children = new Set<VisualElement>()

    /**
     * Manages the subscriptions for a visual element's lifecycle, for instance
     * onRender and onViewportBoxUpdate.
     */
    const lifecycles = createLifecycles()

    /**
     * The latest resolved motion values and target projection.
     * It's from this state that a specific renderer can compute its appearance.
     */
    let visualState = createVisualState(
        props,
        parent,
        blockInitialAnimation,
        snapshot
    )

    /**
     * This is a reference to the visual state of the "lead" visual element.
     * Usually, this will be this visual element. But if it shares a layoutId
     * with other visual elements, only one of them will be designated lead by
     * AnimateSharedLayout. All the other visual elements will take on the visual
     * appearance of the lead while they crossfade to it.
     */
    let leadVisualState = visualState
    let unsubscribeFromLeadVisualElement: Function

    /**
     * The latest layout measurements and calculated projections. This
     * is seperate from the target projection data in visualState as
     * many visual elements might point to the same piece of visualState as
     * a target, whereas they might each have different layouts and thus
     * projection calculations needed to project into the same viewport box.
     */
    const layoutState = createLayoutState()

    /**
     * Each visual element creates a pool of renderer-specific mutable state
     * which allows renderer-specific calculations to occur while reducing GC.
     */
    let renderState = createRenderState()

    /**
     *
     */
    let crossfadeState: CrossfadeState

    /**
     * Keep track of whether the viewport box has been updated since the
     * last time the layout projection was re-calculated.
     */
    let hasViewportBoxUpdated = false

    /**
     * A map of all motion values attached to this visual element. Motion
     * values are source of truth for any given animated value. A motion
     * value might be provided externally by the component via props.
     */
    const values = new Map<string, MotionValue>()

    /**
     * A map of every subscription that binds the provided or generated
     * motion values onChange listeners to this visual element.
     */
    const valueSubscriptions = new Map<string, () => void>()

    /**
     * A reference to the previously-provided motion values as returned
     * from scrapeMotionValuesFromProps. We use the keys in here to determine
     * if any motion values need to be removed after props are updated.
     */
    let prevMotionValues: MotionStyle = {}

    /**
     * x/y motion values that track the progress of initiated layout
     * animations.
     *
     * TODO: Target for removal
     */
    let projectionTargetProgress: MotionPoint

    /**
     * When values are removed from all animation props we need to search
     * for a fallback value to animate to. These values are tracked in baseTarget.
     *
     * TODO: Maybe put in visualState?
     */
    const baseTarget: { [key: string]: string | number | null } = {
        ...visualState.values,
    }

    // Internal methods ========================

    /**
     * On mount, this will be hydrated with a callback to disconnect
     * this visual element from its parent on unmount.
     */
    let removeFromParent: undefined | (() => void)

    /**
     *
     */
    function mount() {
        element.pointTo(element)
        removeFromParent = parent?.addChild(element)
        onMount?.(element, instance, renderState)
    }

    /**
     *
     */
    function unmount() {
        cancelSync.update(update)
        cancelSync.render(render)
        cancelSync.preRender(element.updateLayoutProjection)
        valueSubscriptions.forEach((remove) => remove())
        element.stopLayoutAnimation()
        removeFromParent?.()
        lifecycles.clearAllListeners()
    }

    /**
     *
     */
    function isProjecting() {
        return visualState.projection.isEnabled && layoutState.isHydrated
    }

    /**
     *
     */
    function render() {
        if (!instance) return

        /**
         * This is duplicated work during crossfades
         */
        if (isProjecting()) {
            const { projection } = leadVisualState

            /**
             * Apply the latest user-set transforms to the targetBox to produce the targetBoxFinal.
             * This is the final box that we will then project into by calculating a transform delta and
             * applying it to the corrected box.
             */
            applyBoxTransforms(
                projection.targetFinal,
                projection.target,
                leadVisualState.values
            )

            /**
             * Update the delta between the corrected box and the final target box, after
             * user-set transforms are applied to it. This will be used by the renderer to
             * create a transform style that will reproject the element from its actual layout
             * into the desired bounding box.
             */
            updateBoxDelta(
                layoutState.deltaFinal,
                layoutState.layoutCorrected,
                projection.targetFinal,
                0.5
            )
        }

        triggerBuild()
        renderInstance(instance, renderState)
    }

    function triggerBuild() {
        // TODO: Cut this down to one build, passing through crossfaded values
        build(
            element,
            renderState,
            /**
             * TODO: This used to build leadVisualState and is now visualState
             * Look into ditching visualState and just leading projection, allowing
             * crossfade to blend between elements
             * DO NOT MERGE before this is finalised
             */
            visualState,
            layoutState,
            options,
            props
        )

        if (crossfadeState && crossfadeState.isCrossfading()) {
            build(
                element,
                renderState,
                crossfadeState.getValues(element),
                layoutState,
                options,
                props
            )
        }
    }

    /**
     *
     */
    function update() {
        lifecycles.notifyUpdate(visualState.values)
    }

    /**
     *
     */
    function updateLayoutProjection() {
        const { projection } = leadVisualState
        const { delta, treeScale } = layoutState
        const prevTreeScaleX = treeScale.x
        const prevTreeScaleY = treeScale.x
        const prevDeltaTransform = layoutState.deltaTransform

        hasViewportBoxUpdated &&
            element.notifyViewportBoxUpdate(projection.target)
        hasViewportBoxUpdated = false

        updateLayoutDeltas(layoutState, projection, element.path)

        const deltaTransform = buildLayoutProjectionTransform(delta, treeScale)

        if (
            deltaTransform !== prevDeltaTransform ||
            // Also compare calculated treeScale, for values that rely on this only for scale correction
            prevTreeScaleX !== treeScale.x ||
            prevTreeScaleY !== treeScale.y
        ) {
            element.scheduleRender()
        }
        layoutState.deltaTransform = deltaTransform
    }

    /**
     *
     */
    function bindToMotionValue(key: string, value: MotionValue) {
        const removeOnChange = value.onChange(
            (latestValue: string | number) => {
                visualState.values[key] = latestValue
                props.onUpdate && sync.update(update, false, true)
            }
        )

        const removeOnRenderRequest = value.onRenderRequest(
            element.scheduleRender
        )

        valueSubscriptions.set(key, () => {
            removeOnChange()
            removeOnRenderRequest()
        })
    }

    /**
     * Any motion values that are provided to the element when created
     * aren't yet bound to the element, as this would technically be impure.
     * However, we iterate through the motion values and set them to the
     * initial values for this component.
     *
     * TODO: This is impure and we should look at changing this to run on mount.
     * Doing so will break some tests but this isn't neccessarily a breaking change,
     * more a reflection of the test.
     */
    const initialMotionValues = scrapeMotionValuesFromProps(props)
    for (const key in initialMotionValues) {
        const value = initialMotionValues[key]
        if (visualState.values[key] !== undefined && isMotionValue(value)) {
            value.set(visualState.values[key], false)
        }
    }

    /**
     * Determine what role this visual element should take in the variant tree.
     */
    const isControllingVariants = checkIfControllingVariants(props)
    const definesInitialVariant = isVariantLabel(props.initial)
    const isVariantNode = Boolean(
        definesInitialVariant || isControllingVariants || props.variants
    )

    const element: VisualElement<Instance> = {
        /**
         * This is a mirror of the internal instance prop, which keeps
         * VisualElement type-compatible with React's RefObject.
         */
        current: null,

        /**
         * The depth of this visual element within the visual element tree.
         */
        depth: parent ? parent.depth + 1 : 0,

        /**
         * An ancestor path back to the root visual element. This is used
         * by layout projection to quickly recurse back up the tree.
         */
        path: parent ? [...parent.path, parent] : [],

        /**
         *
         */
        presenceId,

        /**
         * If this component is part of the variant tree, it should track
         * any children that are also part of the tree. This is essentially
         * a shadow tree to simplify logic around how to stagger over children.
         */
        variantChildren: isVariantNode ? new Set() : undefined,

        /**
         * Whether this instance is visible. This can be changed imperatively
         * by AnimateSharedLayout, is analogous to CSS's visibility in that
         * hidden elements should take up layout, and needs enacting by the configured
         * render function.
         */
        isVisible: undefined,

        /**
         * Normally, if a component is controlled by a parent's variants, it can
         * rely on that ancestor to trigger animations further down the tree.
         * However, if a component is created after its parent is mounted, the parent
         * won't trigger that mount animation so the child needs to.
         *
         * TODO: This might be better replaced with a method isParentMounted
         */
        manuallyAnimateOnMount: Boolean(parent?.isMounted()),

        /**
         * This can be set by AnimatePresence to force components that mount
         * at the same time as it to mount as if they have initial={false} set.
         */
        blockInitialAnimation,

        /**
         * Used by animation state to determine whether to treat this component's
         * initial animation like an initial animation or a subsequent one, as if
         * its resuming from a previous component.
         */
        isResumingFromSnapshot: !!snapshot,

        /**
         * If a visual element is static, it's essentially in "pure" mode with
         * no additional functionality like animations or gestures loaded in.
         * This can be considered Framer canvas mode.
         */
        isStatic,

        /**
         * A boolean that can be used to determine whether to respect hover events.
         * For layout measurements we often have to reposition the instance by
         * removing its transform. This can trigger hover events, which is
         * undesired.
         */
        isHoverEventsEnabled: true,

        /**
         * Determine whether this component has mounted yet. This is mostly used
         * by variant children to determine whether they need to trigger their
         * own animations on mount.
         */
        isMounted: () => Boolean(instance),

        /**
         * Add a child visual element to our set of children.
         */
        addChild(child) {
            children.add(child)
            return () => children.delete(child)
        },

        getVisualState: () => visualState,

        /**
         * A method that schedules an update to layout projections throughout
         * the tree. We inherit from the parent so there's only ever one
         * job scheduled on the next frame - that of the root visual element.
         */
        scheduleUpdateLayoutProjection: parent
            ? parent.scheduleUpdateLayoutProjection
            : () => sync.preRender(element.updateLayoutProjection, false, true),

        /**
         * Subscribe this component to receive variant animations from its
         * closest ancestor variant node.
         */
        subscribeToVariantParent() {
            if (!isVariantNode || !parent || isControllingVariants) return
            variantParent?.variantChildren!.add(element)
        },

        /**
         * Expose the latest layoutId prop.
         */
        getLayoutId: () => props.layoutId,

        /**
         * Returns the current instance.
         */
        getInstance: () => instance,

        /**
         * Get/set the latest static values.
         */
        getStaticValue: (key) => visualState.values[key],
        setStaticValue: (key, value) => (visualState.values[key] = value),

        /**
         * Returns the latest motion value state. Currently only used to take
         * a snapshot of the visual element - perhaps this can return the whole
         * visual state
         */
        getLatestValues: () => visualState.values,

        /**
         * Replaces the current mutable states with fresh ones. This is used
         * in static mode where rather than creating a new visual element every
         * render we can just make fresh state.
         */
        clearState(newProps) {
            values.clear()
            props = newProps
            leadVisualState = visualState = createVisualState(
                props,
                parent,
                blockInitialAnimation
            )
            renderState = createRenderState()
        },

        /**
         * Set the visiblity of the visual element. If it's changed, schedule
         * a render to reflect these changes.
         */
        setVisibility(visibility) {
            if (element.isVisible === visibility) return
            element.isVisible = visibility

            element.scheduleRender()
        },

        /**
         * Make a target animatable by Popmotion. For instance, if we're
         * trying to animate width from 100px to 100vw we need to measure 100vw
         * in pixels to determine what we really need to animate to. This is also
         * pluggable to support Framer's custom value types like Color,
         * and CSS variables.
         */
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

        // Motion values ========================

        /**
         * Add a motion value and bind it to this visual element.
         */
        addValue(key, value) {
            // Remove existing value if it exists
            if (element.hasValue(key)) element.removeValue(key)

            values.set(key, value)
            visualState.values[key] = value.get()
            bindToMotionValue(key, value)
        },

        /**
         * Remove a motion value and unbind any active subscriptions.
         */
        removeValue(key) {
            values.delete(key)
            valueSubscriptions.get(key)?.()
            valueSubscriptions.delete(key)
            delete visualState.values[key]
            removeValueFromMutableState(key, renderState)
        },

        /**
         * Check whether we have a motion value for this key
         */
        hasValue: (key) => values.has(key),

        /**
         * Get a motion value for this key. If called with a default
         * value, we'll create one if none exists.
         */
        getValue(key: string, defaultValue?: string | number) {
            let value = values.get(key)

            if (value === undefined && defaultValue !== undefined) {
                value = motionValue(defaultValue)
                element.addValue(key, value)
            }

            return value as MotionValue
        },

        /**
         * Iterate over our motion values.
         */
        forEachValue: (callback) => values.forEach(callback),

        /**
         * If we're trying to animate to a previously unencountered value,
         * we need to check for it in our state and as a last resort read it
         * directly from the instance (which might have performance implications).
         */
        readValue: (key: string) =>
            visualState.values[key] ??
            readValueFromInstance(instance, key, options),

        /**
         * Set the base target to later animate back to. This is currently
         * only hydrated on creation and when we first read a value.
         */
        setBaseTarget(key, value) {
            baseTarget[key] = value
        },

        /**
         * Find the base target for a value thats been removed from all animation
         * props.
         */
        getBaseTarget(key) {
            if (getBaseTarget) {
                const target = getBaseTarget(props, key)
                if (target !== undefined && !isMotionValue(target))
                    return target
            }
            return baseTarget[key]
        },

        // Lifecyles ========================

        ...lifecycles,

        /**
         * A ref function to be provided to the mounting React component.
         * This is used to hydrated the instance and run mount/unmount lifecycles.
         */
        ref(mountingElement: any) {
            instance = element.current = mountingElement
            mountingElement ? mount() : unmount()

            if (!externalRef) return
            if (typeof externalRef === "function") {
                externalRef(mountingElement)
            } else if (isRefObject(externalRef)) {
                ;(externalRef as any).current = mountingElement
            }
        },

        /**
         * Build the renderer state based on the latest visual state.
         */
        build() {
            triggerBuild()
            return renderState
        },

        /**
         * Schedule a render on the next animation frame.
         */
        scheduleRender() {
            sync.render(render, false, true)
        },

        /**
         * Synchronously fire render. It's prefered that we batch renders but
         * in many circumstances, like layout measurement, we need to run this
         * synchronously. However in those instances other measures should be taken
         * to batch reads/writes.
         */
        syncRender() {
            render()
        },

        /**
         * Update the provided props. Ensure any newly-added motion values are
         * added to our map, old ones removed, and listeners updated.
         */
        updateProps(newProps) {
            props = newProps
            lifecycles.updatePropListeners(newProps)

            prevMotionValues = updateMotionValuesFromProps(
                element,
                scrapeMotionValuesFromProps(props),
                prevMotionValues
            )
        },

        // Variants ==============================

        /**
         * Returns the variant definition with a given name.
         */
        getVariant: (name) => props.variants?.[name],

        /**
         * Returns the data that should be used to resolve a variant resolver.
         */
        getVariantData: () => props.custom,

        /**
         * Returns the defined default transition on this component.
         */
        getDefaultTransition: () => props.transition,
        /**
         * Used by child variant nodes to get the closest ancestor variant props.
         */
        getVariantContext(startAtParent = false) {
            if (startAtParent) return parent?.getVariantContext()

            if (!isControllingVariants) {
                const context = parent?.getVariantContext() || {}
                if (props.initial !== undefined) {
                    context.initial = props.initial as any
                }
                return context
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

        // Layout projection ==============================

        /**
         * Enable layout projection for this visual element. Won't actually
         * occur until we also have hydrated layout measurements.
         */
        enableLayoutProjection() {
            visualState.projection.isEnabled = true
        },

        /**
         * Lock the projection target, for instance when dragging, so
         * nothing else can try and animate it.
         */
        lockProjectionTarget() {
            visualState.projection.isTargetLocked = true
        },
        unlockProjectionTarget() {
            element.stopLayoutAnimation()
            visualState.projection.isTargetLocked = false
        },

        /**
         * Record the viewport box as it was before an expected mutation/re-render
         */
        snapshotViewportBox() {
            // TODO: Store this snapshot in LayoutState
            element.prevViewportBox = element.measureViewportBox(false)

            /**
             * Update targetBox to match the prevViewportBox. This is just to ensure
             * that targetBox is affected by scroll in the same way as the measured box
             */
            element.rebaseProjectionTarget(false, element.prevViewportBox)
        },

        /**
         * Get the projection state.
         */
        getProjection: () => visualState.projection,
        getLayoutState: () => layoutState,

        setCrossfadeState(stackCrossfadeState) {
            crossfadeState = stackCrossfadeState
        },

        /**
         * Start a layout animation on a given axis.
         * TODO: This could be better.
         */
        startLayoutAnimation(axis, transition) {
            const progress = element.getProjectionAnimationProgress()[axis]
            const { min, max } = visualState.projection.target[axis]
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

        /**
         * Stop layout animations.
         */
        stopLayoutAnimation() {
            eachAxis((axis) =>
                element.getProjectionAnimationProgress()[axis].stop()
            )
        },

        /**
         * Measure the current viewport box with or without transforms.
         * Only measures axis-aligned boxes, rotate and skew must be manually
         * removed with a re-render to work.
         */
        measureViewportBox(withTransform = true) {
            const viewportBox = measureViewportBox(instance, options)
            if (!withTransform)
                removeBoxTransforms(viewportBox, visualState.values)
            return viewportBox
        },

        /**
         * Update the layoutState by measuring the DOM layout. This
         * should be called after resetting any layout-affecting transforms.
         */
        updateLayoutMeasurement() {
            layoutState.isHydrated = true
            layoutState.layout = element.measureViewportBox()
            layoutState.layoutCorrected = copyAxisBox(layoutState.layout)

            element.notifyLayoutMeasure(
                layoutState.layout,
                element.prevViewportBox || layoutState.layout
            )

            sync.update(() => element.rebaseProjectionTarget())
        },

        /**
         * Get the motion values tracking the layout animations on each
         * axis. Lazy init if not already created.
         */
        getProjectionAnimationProgress() {
            projectionTargetProgress ||= {
                x: motionValue(0),
                y: motionValue(0),
            }

            return projectionTargetProgress
        },

        /**
         * Update the projection of a single axis. Schedule an update to
         * the tree layout projection.
         */
        setProjectionTargetAxis(axis, min, max) {
            const target = visualState.projection.target[axis]
            target.min = min
            target.max = max

            // Flag that we want to fire the onViewportBoxUpdate event handler
            hasViewportBoxUpdated = true

            lifecycles.notifySetAxisTarget()
        },

        /**
         * Rebase the projection target on top of the provided viewport box
         * or the measured layout. This ensures that non-animating elements
         * don't fall out of sync differences in measurements vs projections
         * after a page scroll or other relayout.
         */
        rebaseProjectionTarget(force, box = layoutState.layout) {
            const { x, y } = element.getProjectionAnimationProgress()

            const shouldRebase =
                !visualState.projection.isTargetLocked &&
                !x.isAnimating() &&
                !y.isAnimating()

            if (force || shouldRebase) {
                eachAxis((axis) => {
                    const { min, max } = box[axis]
                    element.setProjectionTargetAxis(axis, min, max)
                })
            }
        },

        /**
         * Notify the visual element that its layout is up-to-date.
         * Currently Animate.tsx uses this to check whether a layout animation
         * needs to be performed.
         */
        notifyLayoutReady(config) {
            element.notifyLayoutUpdate(
                layoutState.layout,
                element.prevViewportBox || layoutState.layout,
                config
            )
        },

        /**
         * Temporarily reset the transform of the instance.
         */
        resetTransform: () => resetTransform(element, instance, props),

        /**
         * Perform the callback after temporarily unapplying the transform
         * upwards through the tree.
         */
        withoutTransform(callback) {
            const { isEnabled } = visualState.projection
            isEnabled && element.resetTransform()

            parent ? parent.withoutTransform(callback) : callback()

            isEnabled && restoreTransform(instance, renderState)
        },

        updateLayoutProjection() {
            isProjecting() && updateLayoutProjection()
            children.forEach(fireUpdateLayoutProjection)
        },

        /**
         *
         */
        pointTo(newLead) {
            leadVisualState = newLead.getVisualState()
            unsubscribeFromLeadVisualElement?.()
            unsubscribeFromLeadVisualElement = pipe(
                newLead.onSetAxisTarget(element.scheduleUpdateLayoutProjection),
                newLead.onRender(render)
            )
        },

        // TODO: Clean this up
        isPresent: true,
        presence: Presence.Entering,
    }

    return element
}

function fireUpdateLayoutProjection(child: VisualElement) {
    child.updateLayoutProjection()
}

const variantProps = ["initial", ...variantPriorityOrder]
const numVariantProps = variantProps.length
