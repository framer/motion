import sync, { cancelSync } from "framesync"
import { invariant } from "hey-listen"
import { createElement } from "react"
import { MotionConfigProps } from "../components/MotionConfig"
import { ReducedMotionConfig } from "../context/MotionConfigContext"
import { SwitchLayoutGroupContext } from "../context/SwitchLayoutGroupContext"
import { featureDefinitions } from "../motion/features/definitions"
import { FeatureBundle, FeatureDefinition } from "../motion/features/types"
import { MotionProps, MotionStyle } from "../motion/types"
import { Box } from "../projection/geometry/types"
import { IProjectionNode } from "../projection/node/types"
import { TargetAndTransition } from "../types"
import { isRefObject } from "../utils/is-ref-object"
import { env } from "../utils/process"
import { initPrefersReducedMotion } from "../utils/reduced-motion"
import {
    hasReducedMotionListener,
    prefersReducedMotion,
} from "../utils/reduced-motion/state"
import { SubscriptionManager } from "../utils/subscription-manager"
import { motionValue, MotionValue } from "../value"
import { isWillChangeMotionValue } from "../value/use-will-change/is"
import { isMotionValue } from "../value/utils/is-motion-value"
import {
    ResolvedValues,
    ScrapeMotionValuesFromProps,
    VariantStateContext,
    VisualElementEventCallbacks,
    VisualElementOptions,
} from "./types"
import { AnimationState, variantPriorityOrder } from "./utils/animation-state"
import {
    isControllingVariants as checkIsControllingVariants,
    isVariantNode as checkIsVariantNode,
} from "./utils/is-controlling-variants"
import { isVariantLabel } from "./utils/is-variant-label"
import { updateMotionValuesFromProps } from "./utils/motion-values"
import { resolveVariantFromProps } from "./utils/resolve-variants"

const featureNames = Object.keys(featureDefinitions)
const numFeatures = featureNames.length

export abstract class VisualElement<
    Instance = unknown,
    RenderState = unknown,
    Options = unknown
> {
    /**
     * A unique string identifier for the VisualElement type. Used to
     * identify when crossing type boundaries.
     */
    abstract type: string

    abstract build(
        visualElement: VisualElement<Instance>,
        renderState: RenderState,
        latestValues: ResolvedValues,
        options: Options,
        props: MotionProps
    ): void

    abstract sortInstanceNodePosition(a: Instance, b: Instance): number

    abstract makeTargetAnimatableFromInstance(
        element: VisualElement<Instance>,
        target: TargetAndTransition,
        props: MotionProps,
        isLive: boolean
    ): TargetAndTransition

    abstract measureInstanceViewportBox(
        instance: Instance,
        props: MotionProps & MotionConfigProps
    ): Box

    abstract getBaseTargetFromInstance(
        props: MotionProps,
        key: string
    ): string | number | undefined | MotionValue

    abstract readValueFromInstance(
        instance: Instance,
        key: string,
        options: Options
    ): string | number | null | undefined

    abstract resetTransform(
        element: VisualElement<Instance>,
        instance: Instance,
        props: MotionProps
    ): void

    abstract restoreTransform(
        instance: Instance,
        renderState: RenderState
    ): void

    abstract renderInstance(
        instance: Instance,
        renderState: RenderState,
        styleProp?: MotionStyle,
        projection?: IProjectionNode
    ): void

    abstract removeValueFromRenderState(
        key: string,
        renderState: RenderState
    ): void

    scrapeMotionValuesFromProps(_props: MotionProps): {
        [key: string]: MotionValue | string | number
    } {
        return {}
    }

    isPresent = true

    /**
     * A reference to the current underlying instance, e.g. a HTMLElement
     * or Three.Mesh etc.
     */
    current: Instance | null = null

    parent: VisualElement | undefined

    /**
     * The depth of this VisualElement within the overall VisualElement tree.
     */
    depth: number

    children = new Set<VisualElement>()

    renderState: RenderState

    latestValues: ResolvedValues

    /**
     * Determine what role this visual element should take in the variant tree.
     */
    isVariantNode: boolean = false
    isControllingVariants: boolean = false

    /**
     * If this component is part of the variant tree, it should track
     * any children that are also part of the tree. This is essentially
     * a shadow tree to simplify logic around how to stagger over children.
     */
    variantChildren?: Set<VisualElement>

    /**
     * Decides whether this VisualElement should animate in reduced motion
     * mode.
     *
     * TODO: This is currently set on every individual VisualElement but feels
     * like it could be set globally.
     */
    shouldReduceMotion: boolean | null = null

    /**
     * Normally, if a component is controlled by a parent's variants, it can
     * rely on that ancestor to trigger animations further down the tree.
     * However, if a component is created after its parent is mounted, the parent
     * won't trigger that mount animation so the child needs to.
     *
     * TODO: This might be better replaced with a method isParentMounted
     */
    manuallyAnimateOnMount: boolean

    /**
     * This can be set by AnimatePresence to force components that mount
     * at the same time as it to mount as if they have initial={false} set.
     */
    blockInitialAnimation: boolean

    projection?: IProjectionNode
    /**
     * A map of all motion values attached to this visual element. Motion
     * values are source of truth for any given animated value. A motion
     * value might be provided externally by the component via props.
     */
    values = new Map<string, MotionValue>()

    private options: Options

    /**
     * A map of every subscription that binds the provided or generated
     * motion values onChange listeners to this visual element.
     */
    private valueSubscriptions = new Map<string, VoidFunction>()

    private props: MotionProps

    private reducedMotionConfig: ReducedMotionConfig | undefined

    /**
     * On mount, this will be hydrated with a callback to disconnect
     * this visual element from its parent on unmount.
     */
    private removeFromVariantTree: undefined | VoidFunction

    /**
     * A reference to the previously-provided motion values as returned
     * from scrapeMotionValuesFromProps. We use the keys in here to determine
     * if any motion values need to be removed after props are updated.
     */
    private prevMotionValues: MotionStyle = {}

    /**
     * When values are removed from all animation props we need to search
     * for a fallback value to animate to. These values are tracked in baseTarget.
     */
    private baseTarget: ResolvedValues

    /**
     * Create an object of the values we initially animated from (if initial prop present).
     */
    private initialValues: ResolvedValues

    private events: {
        [key: string]: SubscriptionManager<any>
    }

    private propEventSubscriptions: {
        [key: string]: VoidFunction
    }

    animationState?: AnimationState

    constructor(
        {
            parent,
            props,
            reducedMotionConfig,
            visualState,
        }: VisualElementOptions<Instance, RenderState>,
        options: Options
    ) {
        const { latestValues, renderState } = visualState
        this.latestValues = latestValues
        this.baseTarget = { ...latestValues }
        this.initialValues = props.initial ? { ...latestValues } : {}
        this.renderState = renderState
        this.parent = parent
        this.props = props
        this.depth = parent ? parent.depth + 1 : 0
        this.reducedMotionConfig = reducedMotionConfig
        this.options = options

        this.isControllingVariants = checkIsControllingVariants(props)
        this.isVariantNode = checkIsVariantNode(props)
        if (this.isVariantNode) {
            this.variantChildren = new Set()
        }

        this.manuallyAnimateOnMount = Boolean(parent && parent.current)

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
        const { willChange, ...initialMotionValues } =
            this.scrapeMotionValuesFromProps(props)

        for (const key in initialMotionValues) {
            const value = initialMotionValues[key]

            if (latestValues[key] !== undefined && isMotionValue(value)) {
                value.set(latestValues[key], false)

                if (isWillChangeMotionValue(willChange)) {
                    willChange.add(key)
                }
            }
        }

        /**
         * Update external values with initial values
         */
        if (props.values) {
            for (const key in props.values) {
                const value = props.values[key] as MotionValue<number | string>
                if (latestValues[key] !== undefined && isMotionValue(value)) {
                    value.set(latestValues[key])
                }
            }
        }
    }

    mount(instance: Instance) {
        this.current = instance

        if (this.projection) {
            this.projection.mount(instance)
        }

        if (this.parent && this.isVariantNode && !this.isControllingVariants) {
            this.removeFromVariantTree = this.parent?.addVariantChild(this)
        }

        this.values.forEach((value, key) => this.bindToMotionValue(key, value))

        if (!hasReducedMotionListener.current) {
            initPrefersReducedMotion()
        }

        this.shouldReduceMotion =
            this.reducedMotionConfig === "never"
                ? false
                : this.reducedMotionConfig === "always"
                ? true
                : prefersReducedMotion.current

        if (this.parent) this.parent.children.add(this)
        this.setProps(this.props)
    }

    unmount() {
        this.projection?.unmount()
        cancelSync.update(this.notifyUpdate)
        cancelSync.render(this.render)
        this.valueSubscriptions.forEach((remove) => remove())
        this.removeFromVariantTree?.()
        this.parent?.children.delete(this)
        for (const key in this.events) {
            this.events[key].clear()
        }
        this.current = null
    }

    private bindToMotionValue(key: string, value: MotionValue) {
        const removeOnChange = value.onChange(
            (latestValue: string | number) => {
                this.latestValues[key] = latestValue
                this.props.onUpdate &&
                    sync.update(this.notifyUpdate, false, true)
            }
        )

        const removeOnRenderRequest = value.onRenderRequest(this.scheduleRender)

        this.valueSubscriptions.set(key, () => {
            removeOnChange()
            removeOnRenderRequest()
        })
    }

    sortNodePosition(other: VisualElement<Instance>) {
        /**
         * If these nodes aren't even of the same type we can't compare their depth.
         */
        if (
            !this.current ||
            !this.sortInstanceNodePosition ||
            this.type !== other.type
        )
            return 0

        return this.sortInstanceNodePosition(
            this.current as Instance,
            other.current as Instance
        )
    }

    loadFeatures(
        renderedProps: MotionProps,
        isStrict?: boolean,
        preloadedFeatures?: FeatureBundle,
        projectionId?: number,
        ProjectionNodeConstructor?: any,
        initialLayoutGroupConfig?: SwitchLayoutGroupContext
    ) {
        const features: JSX.Element[] = []

        /**
         * If we're in development mode, check to make sure we're not rendering a motion component
         * as a child of LazyMotion, as this will break the file-size benefits of using it.
         */
        if (env !== "production" && preloadedFeatures && isStrict) {
            invariant(
                false,
                "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead."
            )
        }

        for (let i = 0; i < numFeatures; i++) {
            const name = featureNames[i]
            const { isEnabled, Component } = featureDefinitions[
                name
            ] as FeatureDefinition

            /**
             * It might be possible in the future to use this moment to
             * dynamically request functionality. In initial tests this
             * was producing a lot of duplication amongst bundles.
             */
            if (isEnabled(renderedProps) && Component) {
                features.push(
                    createElement(Component, {
                        key: name,
                        ...renderedProps,
                        visualElement: this,
                    })
                )
            }
        }

        if (!this.projection && ProjectionNodeConstructor) {
            this.projection = new ProjectionNodeConstructor(
                projectionId,
                this.latestValues,
                this.parent && this.parent.projection
            ) as IProjectionNode

            const { layoutId, layout, drag, dragConstraints, layoutScroll } =
                renderedProps
            this.projection.setOptions({
                layoutId,
                layout,
                alwaysMeasureLayout:
                    Boolean(drag) ||
                    (dragConstraints && isRefObject(dragConstraints)),
                visualElement: this,
                scheduleRender: () => this.scheduleRender(),
                /**
                 * TODO: Update options in an effect. This could be tricky as it'll be too late
                 * to update by the time layout animations run.
                 * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
                 * ensuring it gets called if there's no potential layout animations.
                 *
                 */
                animationType: typeof layout === "string" ? layout : "both",
                initialPromotionConfig: initialLayoutGroupConfig,
                layoutScroll,
            })
        }

        return features
    }

    notifyUpdate = () => this.notify("Update", this.latestValues)

    triggerBuild() {
        this.build(
            this,
            this.renderState,
            this.latestValues,
            this.options,
            this.props
        )
    }

    render = () => {
        if (!this.current) return

        this.triggerBuild()
        this.renderInstance(
            this.current,
            this.renderState,
            this.props.style,
            this.projection
        )
    }

    scheduleRender = () => sync.render(this.render, false, true)

    /**
     * Measure the current viewport box with or without transforms.
     * Only measures axis-aligned boxes, rotate and skew must be manually
     * removed with a re-render to work.
     */
    measureViewportBox() {
        return this.measureInstanceViewportBox(this.current!, this.props)
    }

    getStaticValue(key: string) {
        return this.latestValues[key]
    }

    setStaticValue(key: string, value: string | number) {
        this.latestValues[key] = value
    }

    /**
     * Make a target animatable by Popmotion. For instance, if we're
     * trying to animate width from 100px to 100vw we need to measure 100vw
     * in pixels to determine what we really need to animate to. This is also
     * pluggable to support Framer's custom value types like Color,
     * and CSS variables.
     */
    makeTargetAnimatable(
        target: TargetAndTransition,
        canMutate = true
    ): TargetAndTransition {
        return this.makeTargetAnimatableFromInstance(
            this,
            target,
            this.props,
            canMutate
        )
    }

    /**
     * Update the provided props. Ensure any newly-added motion values are
     * added to our map, old ones removed, and listeners updated.
     */
    setProps(props: MotionProps) {
        if (props.transformTemplate || this.props.transformTemplate) {
            this.scheduleRender()
        }

        this.props = props

        /**
         * Update event handlers
         */
        for (const key in this.events) {
            if (this.propEventSubscriptions[key]) {
                this.propEventSubscriptions[key]()
                delete this.propEventSubscriptions[key]
            }

            const listener = props["on" + key]
            if (listener) {
                this.propEventSubscriptions[key] = this.on(key as any, listener)
            }
        }

        this.prevMotionValues = updateMotionValuesFromProps(
            this,
            this.scrapeMotionValuesFromProps(props),
            this.prevMotionValues
        )
    }

    getProps() {
        return this.props
    }

    /**
     * Returns the variant definition with a given name.
     */
    getVariant(name: string) {
        return this.props.variants?.[name]
    }

    /**
     * Returns the defined default transition on this component.
     */
    getDefaultTransition() {
        return this.props.transition
    }

    getTransformPagePoint() {
        return (this.props as any).transformPagePoint
    }

    getClosestVariantNode(): VisualElement | undefined {
        return this.isVariantNode ? this : this.parent?.getClosestVariantNode()
    }

    getVariantContext(startAtParent = false): undefined | VariantStateContext {
        if (startAtParent) return this.parent?.getVariantContext()

        if (!this.isControllingVariants) {
            const context = this.parent?.getVariantContext() || {}
            if (this.props.initial !== undefined) {
                context.initial = this.props.initial as any
            }
            return context
        }

        const context = {}
        for (let i = 0; i < numVariantProps; i++) {
            const name = variantProps[i]
            const prop = this.props[name]

            if (isVariantLabel(prop) || prop === false) {
                context[name] = prop
            }
        }

        return context
    }

    /**
     * Add a child visual element to our set of children.
     */
    addVariantChild(child: VisualElement) {
        const closestVariantNode = this.getClosestVariantNode()
        if (closestVariantNode) {
            closestVariantNode.variantChildren?.add(child)
            return () => closestVariantNode.variantChildren!.delete(child)
        }
    }

    /**
     * Add a motion value and bind it to this visual element.
     */
    addValue(key: string, value: MotionValue) {
        // Remove existing value if it exists
        if (this.hasValue(key)) this.removeValue(key)

        this.values.set(key, value)
        this.latestValues[key] = value.get()
        this.bindToMotionValue(key, value)
    }

    /**
     * Remove a motion value and unbind any active subscriptions.
     */
    removeValue(key: string) {
        this.values.delete(key)
        this.valueSubscriptions.get(key)?.()
        this.valueSubscriptions.delete(key)
        delete this.latestValues[key]
        this.removeValueFromRenderState(key, this.renderState)
    }

    /**
     * Check whether we have a motion value for this key
     */
    hasValue(key: string) {
        return this.values.has(key)
    }

    /**
     * Get a motion value for this key. If called with a default
     * value, we'll create one if none exists.
     */
    getValue(key: string, defaultValue?: string | number) {
        if (this.props.values && this.props.values[key]) {
            return this.props.values[key]
        }

        let value = this.values.get(key)

        if (value === undefined && defaultValue !== undefined) {
            value = motionValue(defaultValue)
            this.addValue(key, value)
        }

        return value as MotionValue
    }

    /**
     * If we're trying to animate to a previously unencountered value,
     * we need to check for it in our state and as a last resort read it
     * directly from the instance (which might have performance implications).
     */
    readValue(key: string) {
        return this.latestValues[key] !== undefined || !this.current
            ? this.latestValues[key]
            : this.readValueFromInstance(this.current, key, this.options)
    }

    /**
     * Set the base target to later animate back to. This is currently
     * only hydrated on creation and when we first read a value.
     */
    setBaseTarget(key: string, value: string | number) {
        this.baseTarget[key] = value
    }

    /**
     * Find the base target for a value thats been removed from all animation
     * props.
     */
    getBaseTarget(key: string) {
        const { initial } = this.props
        const valueFromInitial =
            typeof initial === "string" || typeof initial === "object"
                ? resolveVariantFromProps(this.props, initial as any)?.[key]
                : undefined

        /**
         * If this value still exists in the current initial variant, read that.
         */
        if (initial && valueFromInitial !== undefined) {
            return valueFromInitial
        }

        /**
         * Alternatively, if this VisualElement config has defined a getBaseTarget
         * so we can read the value from an alternative source, try that.
         */
        const target = this.getBaseTargetFromInstance(this.props, key)
        if (target !== undefined && !isMotionValue(target)) return target

        /**
         * If the value was initially defined on initial, but it doesn't any more,
         * return undefined. Otherwise return the value as initially read from the DOM.
         */
        return this.initialValues[key] !== undefined &&
            valueFromInitial === undefined
            ? undefined
            : this.baseTarget[key]
    }

    on<EventName extends keyof VisualElementEventCallbacks>(
        eventName: EventName,
        callback: VisualElementEventCallbacks[EventName]
    ) {
        if (!this.events[eventName]) {
            this.events[eventName] = new SubscriptionManager()
        }

        return this.events[eventName].add(callback)
    }

    notify<EventName extends keyof VisualElementEventCallbacks>(
        eventName: EventName,
        ...args: any
    ) {
        this.events[eventName]?.notify(...args)
    }
}

const variantProps = ["initial", ...variantPriorityOrder]
const numVariantProps = variantProps.length
