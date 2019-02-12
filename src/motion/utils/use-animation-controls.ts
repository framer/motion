import { useMemo, useEffect, useContext, RefObject } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue, ActionFactory } from "../../value"
import { complex } from "style-value-types"
import { MotionContext } from "./MotionContext"
import {
    TargetResolver,
    Transition,
    Variants,
    Target,
    TargetAndTransition,
    Variant,
    PopmotionTransitionProps,
} from "../../types"
import { unitConversion } from "../../dom/unit-type-conversion"
import styler from "stylefire"
import { MotionProps, VariantLabels } from "../types"

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

const isAnimatable = (value: string | number) =>
    typeof value === "number" || complex.test(value)
const isTargetResolver = (p: any): p is TargetResolver =>
    typeof p === "function"
const isVariantLabels = (v: any): v is string[] => Array.isArray(v)
const isNumericalString = (v: string) => /^\d*\.?\d+$/.test(v)

export class AnimationControls<P = {}> {
    private props: P
    private values: MotionValuesMap
    private ref: RefObject<Element>
    private variants: Variants = {}
    private baseTarget: Target = {}
    private overrides: Array<AnimationDefinition | undefined> = []
    private resolvedOverrides: Array<TargetAndTransition | undefined> = []
    private defaultTransition?: Transition
    private children?: Set<AnimationControls>
    private isAnimating: Set<string> = new Set()

    constructor(values: MotionValuesMap, ref: RefObject<Element>) {
        this.values = values
        this.ref = ref

        this.values.forEach(
            (value, key) => (this.baseTarget[key] = value.get())
        )
    }

    setProps(props: P) {
        this.props = props
    }

    setVariants(variants?: Variants) {
        if (variants) this.variants = variants
    }

    setDefaultTransition(transition?: Transition) {
        if (transition) this.defaultTransition = transition
    }

    setValues(target: Target, isActive: Set<string> = new Set()) {
        return Object.keys(target).forEach(key => {
            if (isActive.has(key)) return

            isActive.add(key)

            if (this.values.has(key)) {
                const value = this.values.get(key)
                value && value.set(target[key])
            } else {
                this.values.set(key, motionValue(target[key]))
            }

            this.baseTarget[key] = target[key]
        })
    }

    checkForNewValues(target: Target) {
        const newValueKeys = Object.keys(target).filter(
            key => !this.values.has(key)
        )
        if (!newValueKeys.length) return

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
    ): { target?: Target; transition?: Transition; transitionEnd?: Target } {
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

        const { transition, transitionEnd, ...target } = variant
        return { transition, transitionEnd, target }
    }

    getHighestPriority() {
        let highest = 0
        const numOverrides = this.overrides.length

        if (!numOverrides) return highest

        for (let i = 0; i < numOverrides; i++) {
            if (this.overrides[i] !== undefined) {
                highest = i
            }
        }

        return highest
    }

    clearOverride(overrideIndex: number) {
        const override = this.overrides[overrideIndex]
        if (!override) return

        this.overrides[overrideIndex] = undefined
        const highest = this.getHighestPriority()
        this.resetIsAnimating()

        if (highest) {
            const highestOverride = this.overrides[highest]
            highestOverride &&
                this.start(highestOverride, { priority: highest })
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
        this.setPriorityAnimation(definition, opts.priority || 0)
        // Check if this is a priority gesture animation

        this.resetIsAnimating(opts.priority)

        if (isVariantLabels(definition)) {
            return this.animateVariantLabels(definition, opts)
        } else if (typeof definition === "string") {
            return this.animateVariant(definition, opts)
        } else {
            return this.animate(definition, opts)
        }
    }

    setPriorityAnimation(definition: AnimationDefinition, priority: number) {
        this.overrides[priority] = definition
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

        this.checkForNewValues(target)

        const converted = unitConversion(
            this.values,
            this.ref,
            target,
            transitionEnd
        )
        target = converted.target
        transitionEnd = converted.transitionEnd

        if (!transition && this.defaultTransition) {
            transition = this.defaultTransition
        }

        const animations = Object.keys(target).reduce(
            (acc, key) => {
                const value = this.values.get(key)
                if (
                    this.isAnimating.has(key) ||
                    !target ||
                    !value ||
                    target[key] === undefined
                ) {
                    return acc
                }

                const valueTarget = target[key]

                if (!priority) {
                    this.baseTarget[key] = valueTarget
                }

                if (isAnimatable(valueTarget)) {
                    const [action, options] = getTransition(key, valueTarget, {
                        delay,
                        ...transition,
                    })

                    acc.push(
                        value.control(
                            action as ActionFactory,
                            options as PopmotionTransitionProps
                        )
                    )
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
        let beforeChildren = false
        let afterChildren = false
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
                beforeChildren = transition.beforeChildren || beforeChildren
                afterChildren = transition.afterChildren || afterChildren
                delayChildren = transition.delayChildren || delayChildren
                staggerChildren = transition.staggerChildren || staggerChildren
                staggerDirection =
                    transition.staggerDirection || staggerDirection
            }
        }

        if (beforeChildren || afterChildren) {
            const [first, last] = beforeChildren
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

    addChild(controls: AnimationControls) {
        if (!this.children) {
            this.children = new Set()
        }
        this.children.add(controls)
    }

    removeChild(controls: AnimationControls) {
        if (!this.children) {
            return
        }
        this.children.delete(controls)
    }

    resetChildren() {
        if (this.children) this.children.clear()
    }
}

export const useAnimationControls = <P>(
    values: MotionValuesMap,
    props: P & MotionProps,
    ref: RefObject<Element>,
    inherit: boolean
) => {
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const controls = useMemo(() => new AnimationControls<P>(values, ref), [])

    // Reset and resubscribe children every render to ensure stagger order is correct
    controls.resetChildren()

    if (inherit && parentControls) {
        parentControls.addChild(controls)
    }

    useEffect(
        () => () => parentControls && parentControls.removeChild(controls),
        []
    )

    controls.setProps(props)
    controls.setVariants(variants)
    controls.setDefaultTransition(transition)

    return controls
}
