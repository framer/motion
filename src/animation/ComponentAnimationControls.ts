import { RefObject } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { getTransition } from "./utils/transitions"
import { motionValue } from "../value"
import { complex } from "style-value-types"
import {
    TargetResolver,
    Transition,
    Variants,
    Target,
    TargetAndTransition,
    Variant,
    TargetWithKeyframes,
    ValueTarget,
} from "../types"
import { unitConversion } from "../dom/unit-type-conversion"
import styler from "stylefire"
import { VariantLabels, MotionProps } from "../motion/types"
import { transformCustomValues } from "../motion/utils/transform-custom-values"
import { resolveFinalValueInKeyframes } from "../utils/resolve-value"

type AnimationDefinition = VariantLabels | TargetAndTransition | TargetResolver
type AnimationOptions = {
    delay?: number
    priority?: number
}

const getCurrent = (values: MotionValuesMap) => {
    const current = {}
    values.forEach((value, key) => (current[key] = value.get()))
    return current
}

const getVelocity = (values: MotionValuesMap) => {
    const velocity = {}
    values.forEach((value, key) => (velocity[key] = value.getVelocity()))
    return velocity
}

const isAnimatable = (value: ValueTarget) => {
    if (typeof value === "number" || Array.isArray(value)) {
        return true
    } else if (
        typeof value === "string" &&
        complex.test(value) &&
        value.substring(0, 4) !== "url("
    ) {
        return true
    }

    return false
}

const isTargetResolver = (p: any): p is TargetResolver => {
    return typeof p === "function"
}

const isVariantLabels = (v: any): v is string[] => Array.isArray(v)
const isNumericalString = (v: string) => /^\d*\.?\d+$/.test(v)

export class ComponentAnimationControls<P extends {} = {}> {
    private props: P & MotionProps
    private values: MotionValuesMap
    private ref: RefObject<Element>
    private variants: Variants = {}
    private baseTarget: Target = {}
    private overrides: Array<AnimationDefinition | undefined> = []
    private activeOverrides: Set<number> = new Set()
    private resolvedOverrides: Array<TargetAndTransition | undefined> = []
    private defaultTransition?: Transition
    private children?: Set<ComponentAnimationControls>
    private isAnimating: Set<string> = new Set()

    constructor(values: MotionValuesMap, ref: RefObject<Element>) {
        this.values = values
        this.ref = ref

        this.values.forEach(
            (value, key) => (this.baseTarget[key] = value.get())
        )
    }

    setProps(props: P & MotionProps) {
        this.props = props
    }

    setVariants(variants?: Variants) {
        if (variants) this.variants = variants
    }

    setDefaultTransition(transition?: Transition) {
        if (transition) this.defaultTransition = transition
    }

    setValues(target: TargetWithKeyframes, isActive: Set<string> = new Set()) {
        target = transformCustomValues(target)

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

            this.baseTarget[key] = targetValue
        })
    }

    checkForNewValues(target: TargetWithKeyframes) {
        const newValueKeys = Object.keys(target).filter(
            key => !this.values.has(key)
        )
        if (!newValueKeys.length) return

        // Might live better in `MotionValuesMap`
        const domStyler = styler(this.ref.current as Element)
        newValueKeys.forEach(key => {
            const domValue = domStyler.get(key) || 0
            const value =
                typeof domValue === "string" && isNumericalString(domValue)
                    ? parseFloat(domValue)
                    : domValue

            this.values.set(key, motionValue(value))
            this.baseTarget[key] = value
        })
    }

    resolveVariant(
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
                this.props,
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

    getHighestPriority() {
        if (!this.activeOverrides.size) return 0
        return Math.max(...Array.from(this.activeOverrides))
    }

    setOverride(definition: AnimationDefinition, overrideIndex: number) {
        this.overrides[overrideIndex] = definition
    }

    startOverride(overrideIndex: number) {
        const override = this.overrides[overrideIndex]

        if (override) {
            return this.start(override, { priority: overrideIndex })
        }
    }

    clearOverride(overrideIndex: number) {
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

        this.animate(remainingValues)
    }

    apply(definition: VariantLabels | TargetAndTransition) {
        if (Array.isArray(definition)) {
            return this.applyVariantLabels(definition)
        } else if (typeof definition === "string") {
            return this.applyVariantLabels([definition])
        } else {
            this.setValues(definition)
        }
    }

    private applyVariantLabels(variantLabelList: string[]) {
        const isSetting: Set<string> = new Set()
        const reversedList = [...variantLabelList].reverse()

        reversedList.forEach(key => {
            const { target, transitionEnd } = this.resolveVariant(
                this.variants[key]
            )

            if (transitionEnd) {
                this.setValues(transitionEnd, isSetting)
            }

            if (target) {
                this.setValues(target, isSetting)
            }
        })
    }

    start(
        definition: AnimationDefinition,
        opts: AnimationOptions = {}
    ): Promise<any> {
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

        const { onAnimationComplete } = this.props
        return onAnimationComplete
            ? animation.then(onAnimationComplete)
            : animation
    }

    isHighestPriority(priority: number) {
        const numOverrides = this.overrides.length
        for (let i = priority + 1; i < numOverrides; i++) {
            if (this.overrides[i] !== undefined) {
                return false
            }
        }
        return true
    }

    private animate(
        animationDefinition: Variant,
        { delay = 0, priority = 0 }: AnimationOptions = {}
    ) {
        let { target, transition, transitionEnd } = this.resolveVariant(
            animationDefinition
        )

        if (!target) return Promise.resolve()

        if (priority) {
            this.resolvedOverrides[priority] = target
        }

        target = transformCustomValues(target)
        if (transitionEnd) {
            transitionEnd = transformCustomValues(transitionEnd)
        }

        this.checkForNewValues(target)

        const converted = unitConversion(
            this.values,
            this.ref,
            target,
            transitionEnd
        )

        target = converted.target
        transitionEnd = converted.transitionEnd

        // TODO: This might be redundant (see `resolveVariant`)
        if (!transition && this.defaultTransition) {
            transition = this.defaultTransition
        }

        const animations = Object.keys(target).reduce(
            (acc, key) => {
                const value = this.values.get(key)

                if (!value || !target || target[key] === undefined) return acc

                const valueTarget = target[key]

                if (!priority) {
                    this.baseTarget[key] = resolveFinalValueInKeyframes(
                        valueTarget
                    )
                }

                if (this.isAnimating.has(key)) return acc

                if (isAnimatable(valueTarget)) {
                    const [action, options] = getTransition(
                        value,
                        key,
                        valueTarget,
                        {
                            delay,
                            ...transition,
                        }
                    )

                    acc.push(value.control(action, options))
                } else {
                    value.set(valueTarget)
                }

                this.isAnimating.add(key)

                return acc
            },
            [] as Array<Promise<any>>
        )

        return Promise.all(animations).then(() => {
            if (!transitionEnd) return

            this.setValues(transitionEnd)
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

    private animateVariant(
        variantLabel: string,
        opts?: AnimationOptions
    ): Promise<any> {
        let when: false | "beforeChildren" | "afterChildren" = false
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

    addChild(controls: ComponentAnimationControls) {
        if (!this.children) {
            this.children = new Set()
        }
        this.children.add(controls)
    }

    removeChild(controls: ComponentAnimationControls) {
        if (!this.children) {
            return
        }
        this.children.delete(controls)
    }

    resetChildren() {
        if (this.children) this.children.clear()
    }
}
