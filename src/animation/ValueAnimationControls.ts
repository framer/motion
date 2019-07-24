import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { motionValue, MotionValue } from "../value"
import { complex } from "style-value-types"
import {
    TargetResolver,
    Transition,
    Variants,
    Target,
    TargetAndTransition,
    Variant,
    TargetWithKeyframes,
    Orchestration,
} from "../types"
import { VariantLabels, MotionProps } from "../motion/types"
import { resolveFinalValueInKeyframes } from "../utils/resolve-value"
import { getValueType } from "../dom/value-types"
import { startAnimation } from "./utils/transitions"

export type AnimationDefinition =
    | VariantLabels
    | TargetAndTransition
    | TargetResolver

type AnimationOptions = {
    delay?: number
    priority?: number
    transitionOverride?: Transition
}

type SetterOptions = {
    isActive?: Set<string>
    priority?: number
}

/**
 * Get the current value of every `MotionValue`
 * @param values -
 */
const getCurrent = (values: MotionValuesMap) => {
    const current = {}
    values.forEach((value, key) => (current[key] = value.get()))
    return current
}

/**
 * Get the current velocity of every `MotionValue`
 * @param values -
 */
const getVelocity = (values: MotionValuesMap) => {
    const velocity = {}
    values.forEach((value, key) => (velocity[key] = value.getVelocity()))
    return velocity
}

/**
 * Check if value is a function that returns a `Target`. A generic typeof === 'function'
 * check, just helps with typing.
 * @param p -
 */
const isTargetResolver = (p: any): p is TargetResolver => {
    return typeof p === "function"
}

/**
 * Check if value is a list of variant labels
 * @param v -
 */
const isVariantLabels = (v: any): v is string[] => Array.isArray(v)

/**
 * Check if value is a numerical string, ie "100" or "100px"
 */
const isNumericalString = (v: string) => /^\d*\.?\d+$/.test(v)

export type ReadValueFromSource = (key: string) => number | string

export type MakeTargetAnimatable = (
    target: TargetWithKeyframes,
    transitionEnd?: Target | undefined
) => {
    target: TargetWithKeyframes
    transitionEnd?: Target | undefined
}

export interface ValueAnimationConfig {
    values: MotionValuesMap
    readValueFromSource: ReadValueFromSource
    makeTargetAnimatable?: MakeTargetAnimatable
}

/**
 * Control animations for a single component
 * @internal
 */
export class ValueAnimationControls<P extends {} = {}, V extends {} = {}> {
    /**
     * A reference to the component's latest props. We could probably ditch this in
     * favour to a reference to the `custom` prop now we don't send all props through
     * to target resolvers.
     */
    private props: P & MotionProps

    /**
     * A reference to the component's motion values
     */
    private values: MotionValuesMap

    /**
     * The default transition to use for `Target`s without any `transition` prop.
     */
    private defaultTransition?: Transition

    /**
     * The component's variants, as provided by `variants`
     */
    private variants: Variants = {}

    /**
     * A set of values that we animate back to when a value is cleared of all overrides.
     */
    private baseTarget: Target = {}

    /**
     * A series of target overrides that we can animate to/from when overrides are set/cleared.
     */
    private overrides: Array<AnimationDefinition | undefined> = []

    /**
     * A series of target overrides as they were originally resolved.
     */
    private resolvedOverrides: Array<TargetAndTransition | undefined> = []

    /**
     * A Set of currently active override indexes
     */
    private activeOverrides: Set<number> = new Set()

    /**
     * A Set of children component controls for variant propagation.
     */
    private children?: Set<ValueAnimationControls>

    /**
     * A Set of value keys that are currently animating.
     */
    private isAnimating: Set<string> = new Set()

    /**
     * In the event we attempt to animate a value that doesn't exist yet, we use this
     * function to attempt to read it from the source (ie the DOM, or React state etc)
     */
    private readValueFromSource: ReadValueFromSource

    /**
     * A chance
     */
    private makeTargetAnimatable: MakeTargetAnimatable | undefined

    constructor({
        values,
        readValueFromSource,
        makeTargetAnimatable,
    }: ValueAnimationConfig) {
        this.values = values
        this.readValueFromSource = readValueFromSource
        this.makeTargetAnimatable = makeTargetAnimatable

        this.values.forEach(
            (value, key) => (this.baseTarget[key] = value.get())
        )
    }

    /**
     * Set the reference to the component's props.
     * @param props -
     */
    setProps(props: P & MotionProps) {
        this.props = props
    }

    /**
     * Set the reference to the component's variants
     * @param variants -
     */
    setVariants(variants?: Variants) {
        if (variants) this.variants = variants
    }

    /**
     * Set the component's default transition
     * @param transition -
     */
    setDefaultTransition(transition?: Transition) {
        if (transition) this.defaultTransition = transition
    }

    /**
     * Set motion values without animation.
     *
     * @param target -
     * @param isActive -
     */
    private setValues(
        target: TargetWithKeyframes,
        { isActive = new Set(), priority }: SetterOptions = {}
    ) {
        target = this.transformValues(target as any)

        return Object.keys(target).forEach(key => {
            if (isActive.has(key)) return

            isActive.add(key)
            const targetValue = resolveFinalValueInKeyframes(target[key])

            if (this.values.has(key)) {
                const value = this.values.get(key)
                value && value.set(targetValue)
            } else {
                this.values.set(key, motionValue(targetValue))
            }

            if (!priority) this.baseTarget[key] = targetValue
        })
    }

    /**
     * Allows `transformValues` to be set by a component that allows us to
     * transform the values in a given `Target`. This allows Framer Library
     * to extend Framer Motion to animate `Color` variables etc. Currently we have
     * to manually support these extended types here in Framer Motion.
     *
     * @param values -
     */
    private transformValues(values: V): V {
        const { transformValues } = this.props
        return transformValues ? transformValues(values) : values
    }

    /**
     * Check a `Target` for new values we haven't animated yet, and add them
     * to the `MotionValueMap`.
     *
     * Currently there's functionality here that is DOM-specific, we should allow
     * this functionality to be injected by the factory that creates DOM-specific
     * components.
     *
     * @param target -
     */
    private checkForNewValues(target: TargetWithKeyframes) {
        const newValueKeys = Object.keys(target).filter(this.hasValue)
        const numNewValues = newValueKeys.length
        if (!numNewValues) return

        for (let i = 0; i < numNewValues; i++) {
            const key = newValueKeys[i]
            const targetValue = target[key]
            let value: string | number | null = null

            // If this is a keyframes value, we can attempt to use the first value in the
            // array as that's going to be the first value of the animation anyway
            if (Array.isArray(targetValue)) {
                value = targetValue[0]
            }

            // If it isn't a keyframes or the first keyframes value was set as `null`, read the
            // value from the DOM. It might be worth investigating whether to check props (for SVG)
            // or props.style (for HTML) if the value exists there before attempting to read.
            if (value === null) {
                value = this.readValueFromSource(key)
            }

            if (typeof value === "string" && isNumericalString(value)) {
                // If this is a number read as a string, ie "0" or "200", convert it to a number
                value = parseFloat(value)
            } else if (!getValueType(value) && complex.test(targetValue)) {
                // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
                value = complex.getAnimatableNone(targetValue as string)
            }

            this.values.set(key, motionValue(value))
            this.baseTarget[key] = value
        }
    }

    /**
     * Check if the associated `MotionValueMap` has a key with the provided string.
     * Pre-bound to the class so we can provide directly to the `filter` in `checkForNewValues`.
     */
    private hasValue = (key: string) => !this.values.has(key)

    /**
     * Resolve a variant from its label or resolver into an actual `Target` we can animate to.
     * @param variant -
     */
    private resolveVariant(
        variant?: Variant
    ): {
        target?: TargetWithKeyframes
        transition?: Transition
        transitionEnd?: Target
    } {
        if (!variant) {
            return {
                target: undefined,
                transition: undefined,
                transitionEnd: undefined,
            }
        }

        if (isTargetResolver(variant)) {
            // resolve current and velocity
            variant = variant(
                this.props.custom,
                getCurrent(this.values),
                getVelocity(this.values)
            )
        }

        const {
            transition = this.defaultTransition,
            transitionEnd,
            ...target
        } = variant

        return { transition, transitionEnd, target }
    }

    /**
     * Get the highest active override priority index
     */
    private getHighestPriority() {
        if (!this.activeOverrides.size) return 0
        return Math.max(...Array.from(this.activeOverrides))
    }

    /**
     * Set an override. We add this layer of indirection so if, for instance, a tap gesture
     * starts and overrides a hover gesture, when we clear the tap gesture and fallback to the
     * hover gesture, if that hover gesture has changed in the meantime we can go to that rather
     * than the one that was resolved when the hover gesture animation started.
     *
     * @param definition -
     * @param overrideIndex -
     */
    setOverride(definition: AnimationDefinition, overrideIndex: number) {
        this.overrides[overrideIndex] = definition

        if (this.children) {
            this.children.forEach(child =>
                child.setOverride(definition, overrideIndex)
            )
        }
    }

    /**
     * Start an override animation.
     * @param overrideIndex -
     */
    startOverride(overrideIndex: number) {
        const override = this.overrides[overrideIndex]

        if (override) {
            return this.start(override, { priority: overrideIndex })
        }
    }

    /**
     * Clear an override. We check every value we animated to in this override to see if
     * its present on any lower-priority overrides. If not, we animate it back to its base target.
     * @param overrideIndex -
     */
    clearOverride(overrideIndex: number) {
        if (this.children) {
            this.children.forEach(child => child.clearOverride(overrideIndex))
        }

        const override = this.overrides[overrideIndex]
        if (!override) return

        this.activeOverrides.delete(overrideIndex)
        const highest = this.getHighestPriority()
        this.resetIsAnimating()

        if (highest) {
            const highestOverride = this.overrides[highest]
            highestOverride && this.startOverride(highest)
        }

        // Figure out which remaining values were affected by the override and animate those
        const overrideTarget = this.resolvedOverrides[overrideIndex]
        if (!overrideTarget) return

        const remainingValues: Target = {}

        for (const key in this.baseTarget) {
            if (overrideTarget[key] !== undefined) {
                remainingValues[key] = this.baseTarget[key]
            }
        }

        this.onStart()
        this.animate(remainingValues).then(() => this.onComplete())
    }

    /**
     * Apply a target/variant without any animation
     */
    apply(definition: VariantLabels | TargetAndTransition) {
        if (Array.isArray(definition)) {
            return this.applyVariantLabels(definition)
        } else if (typeof definition === "string") {
            return this.applyVariantLabels([definition])
        } else {
            this.setValues(definition)
        }
    }

    /**
     * Apply variant labels without animation
     */
    private applyVariantLabels(variantLabelList: string[]) {
        const isActive: Set<string> = new Set()
        const reversedList = [...variantLabelList].reverse()

        reversedList.forEach(key => {
            const { target, transitionEnd } = this.resolveVariant(
                this.variants[key]
            )

            if (transitionEnd) {
                this.setValues(transitionEnd, { isActive })
            }

            if (target) {
                this.setValues(target, { isActive })
            }

            if (this.children && this.children.size) {
                this.children.forEach(child =>
                    child.applyVariantLabels(variantLabelList)
                )
            }
        })
    }

    start(definition: AnimationDefinition, opts: AnimationOptions = {}) {
        if (opts.priority) {
            this.activeOverrides.add(opts.priority)
        }

        this.resetIsAnimating(opts.priority)

        let animation

        if (isVariantLabels(definition)) {
            animation = this.animateVariantLabels(definition, opts)
        } else if (typeof definition === "string") {
            animation = this.animateVariant(definition, opts)
        } else {
            animation = this.animate(definition, opts)
        }

        this.onStart()
        return animation.then(() => this.onComplete())
    }

    private animate(
        animationDefinition: Variant,
        { delay = 0, priority = 0, transitionOverride }: AnimationOptions = {}
    ) {
        let { target, transition, transitionEnd } = this.resolveVariant(
            animationDefinition
        )

        if (transitionOverride) {
            transition = transitionOverride
        }

        if (!target) return Promise.resolve()

        target = this.transformValues(target as any)
        if (transitionEnd) {
            transitionEnd = this.transformValues(transitionEnd as any)
        }

        this.checkForNewValues(target)

        if (this.makeTargetAnimatable) {
            const animatable = this.makeTargetAnimatable(
                target,
                transitionEnd as any
            )
            target = animatable.target
            transitionEnd = animatable.transitionEnd
        }

        if (priority) {
            this.resolvedOverrides[priority] = target
        }

        this.checkForNewValues(target)

        const animations = Object.keys(target).reduce(
            (acc, key) => {
                const value = this.values.get(key) as MotionValue<
                    number | string
                >
                if (!value || !target || target[key] === undefined) return acc

                const valueTarget = target[key]

                if (!priority) {
                    this.baseTarget[key] = resolveFinalValueInKeyframes(
                        valueTarget
                    )
                }

                if (this.isAnimating.has(key)) return acc

                acc.push(
                    startAnimation(key, value, valueTarget, {
                        delay,
                        ...transition,
                    })
                )

                this.isAnimating.add(key)

                return acc
            },
            [] as Array<Promise<any>>
        )

        return Promise.all(animations).then(() => {
            if (!transitionEnd) return
            this.setValues(transitionEnd, { priority })
        })
    }

    private animateVariantLabels(
        variantLabels: string[],
        opts?: AnimationOptions
    ) {
        const animations = [...variantLabels]
            .reverse()
            .map(label => this.animateVariant(label, opts))
        return Promise.all(animations)
    }

    private animateVariant(variantLabel: string, opts?: AnimationOptions) {
        let when: Orchestration["when"] = false
        let delayChildren = 0
        let staggerChildren = 0
        let staggerDirection = 1
        const priority = (opts && opts.priority) || 0
        const variant = this.variants[variantLabel]

        const getAnimations: () => Promise<any> = variant
            ? () => this.animate(variant, opts)
            : () => Promise.resolve()

        const getChildrenAnimations: () => Promise<any> = this.children
            ? () => {
                  return this.animateChildren(
                      variantLabel,
                      delayChildren,
                      staggerChildren,
                      staggerDirection,
                      priority
                  )
              }
            : () => Promise.resolve()

        if (variant && this.children) {
            const { transition } = this.resolveVariant(variant)
            if (transition) {
                when = transition.when || when
                delayChildren = transition.delayChildren || delayChildren
                staggerChildren = transition.staggerChildren || staggerChildren
                staggerDirection =
                    transition.staggerDirection || staggerDirection
            }
        }

        if (when) {
            const [first, last] =
                when === "beforeChildren"
                    ? [getAnimations, getChildrenAnimations]
                    : [getChildrenAnimations, getAnimations]
            return first().then(last)
        } else {
            return Promise.all([getAnimations(), getChildrenAnimations()])
        }
    }

    private animateChildren(
        variantLabel: string,
        delayChildren: number = 0,
        staggerChildren: number = 0,
        staggerDirection: number = 1,
        priority: number = 0
    ) {
        if (!this.children) {
            return Promise.resolve()
        }

        const animations: Array<Promise<any>> = []
        const maxStaggerDuration = (this.children.size - 1) * staggerChildren
        const generateStaggerDuration =
            staggerDirection === 1
                ? (i: number) => i * staggerChildren
                : (i: number) => maxStaggerDuration - i * staggerChildren

        Array.from(this.children).forEach((childControls, i) => {
            const animation = childControls.animateVariant(variantLabel, {
                priority,
                delay: delayChildren + generateStaggerDuration(i),
            })
            animations.push(animation)
        })

        return Promise.all(animations)
    }

    private onStart() {
        const { onAnimationStart } = this.props
        onAnimationStart && onAnimationStart()
    }

    private onComplete() {
        const { onAnimationComplete } = this.props
        onAnimationComplete && onAnimationComplete()
    }

    private checkOverrideIsAnimating(priority: number) {
        const numOverrides = this.overrides.length
        for (let i = priority + 1; i < numOverrides; i++) {
            const resolvedOverride = this.resolvedOverrides[i]

            if (resolvedOverride) {
                for (const key in resolvedOverride) {
                    this.isAnimating.add(key)
                }
            }
        }
    }

    private resetIsAnimating(priority: number = 0) {
        this.isAnimating.clear()

        // If this isn't the highest priority gesture, block the animation
        // of anything that's currently being animated
        if (priority < this.getHighestPriority()) {
            this.checkOverrideIsAnimating(priority)
        }

        if (this.children) {
            this.children.forEach(child => child.resetIsAnimating(priority))
        }
    }

    stop() {
        this.values.forEach(value => value.stop())
    }

    /**
     * Add the controls of a child component.
     * @param controls -
     */
    addChild(controls: ValueAnimationControls) {
        if (!this.children) {
            this.children = new Set()
        }
        this.children.add(controls)

        // We set child overrides when `setOverride` is called, but also have to do it here
        // as the first time `setOverride` is called all the children might not have been added yet.
        this.overrides.forEach((override, i) => {
            override && controls.setOverride(override, i)
        })
    }

    removeChild(controls: ValueAnimationControls) {
        if (!this.children) {
            return
        }
        this.children.delete(controls)
    }

    resetChildren() {
        if (this.children) this.children.clear()
    }
}
