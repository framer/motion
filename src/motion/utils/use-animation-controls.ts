import { useMemo, useEffect, useContext, RefObject } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue } from "../../value"
import { complex } from "style-value-types"
import { MotionContext } from "./MotionContext"
import { TargetResolver, Transition, Variants, Target, TargetAndTransition, Props, Variant } from "../../types"
import { unitConversion } from "../../dom/unit-type-conversion"
import styler from "stylefire"
import { MotionProps, VariantLabels } from "motion/types"

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)
const isTargetResolver = (p: any): p is TargetResolver => typeof p === "function"
const isVariantLabels = (v: any): v is string[] => Array.isArray(v)

const resolveVariant = (
    variant?: Variant,
    props: Props = {}
): { target?: Target; transition?: Transition; transitionEnd?: Target } => {
    if (!variant) {
        return { target: undefined, transition: undefined, transitionEnd: undefined }
    }

    if (isTargetResolver(variant)) {
        variant = variant(props)
    }

    const { transition, transitionEnd, ...target } = variant
    return { transition, transitionEnd, target }
}

const setValues = (target: Target, values: MotionValuesMap, isActive: Set<string> = new Set()) => {
    return Object.keys(target).forEach(key => {
        if (isActive.has(key)) return

        isActive.add(key)

        if (values.has(key)) {
            const value = values.get(key)
            value && value.set(target[key])
        } else {
            values.set(key, motionValue(target[key]))
        }
    })
}

const checkForNewValues = (target: Target, values: MotionValuesMap, ref: RefObject<Element>) => {
    const newValueKeys = Object.keys(target).filter(key => !values.has(key))

    if (!newValueKeys.length) return

    const domStyler = styler(ref.current as Element)
    newValueKeys.forEach(key => {
        const domValue = domStyler.get(key)
        values.set(key, motionValue(domValue))
    })
}

export class AnimationControls<P = {}> {
    private props: P
    private values: MotionValuesMap
    private ref: RefObject<Element>
    private variants: Variants = {}
    private defaultTransition?: Transition
    private children?: Set<AnimationControls>
    private isAnimating: Set<string> = new Set()

    constructor(values: MotionValuesMap, ref: RefObject<Element>) {
        this.values = values
        this.ref = ref
    }

    setProps(props: P & MotionProps) {
        this.props = props
        this.setDefaultTransition(props.transition)
        this.setVariants(props.variants)
    }

    setVariants(variants?: Variants) {
        if (variants) this.variants = variants
    }

    setDefaultTransition(transition?: Transition) {
        if (transition) this.defaultTransition = transition
    }

    set(definition: VariantLabels | TargetAndTransition) {
        if (Array.isArray(definition)) {
            return this.applyVariantLabels(definition)
        } else if (typeof definition === "string") {
            return this.applyVariantLabels([definition])
        } else {
            setValues(definition, this.values)
        }
    }

    private applyVariantLabels(variantLabelList: string[]) {
        const isSetting: Set<string> = new Set()
        const reversedList = [...variantLabelList].reverse()

        reversedList.forEach(key => {
            const { target, transitionEnd } = resolveVariant(this.variants[key], this.props)

            if (transitionEnd) {
                setValues(transitionEnd, this.values, isSetting)
            }

            if (target) {
                setValues(target, this.values, isSetting)
            }
        })
    }

    start(definition: VariantLabels | TargetAndTransition | TargetResolver, _transition?: Transition): Promise<any> {
        this.resetIsAnimating()

        if (isVariantLabels(definition)) {
            return this.animateVariantLabels(definition)
        } else if (typeof definition === "string") {
            return this.animateVariant(definition)
        } else {
            return this.animate(definition)
        }
    }

    private animate(animationDefinition: Variant, delay: number = 0) {
        let { target, transition, transitionEnd } = resolveVariant(animationDefinition)

        if (!target) return Promise.resolve()

        checkForNewValues(target, this.values, this.ref)

        const converted = unitConversion(this.values, this.ref, target, transitionEnd)
        target = converted.target
        transitionEnd = converted.transitionEnd

        if (!transition && this.defaultTransition) {
            transition = this.defaultTransition
        }

        const animations = Object.keys(target).reduce(
            (acc, key) => {
                if (this.isAnimating.has(key)) return acc

                const value = this.values.get(key)
                if (!value) return acc

                const valueTarget = (target as Target)[key]

                if (isAnimatable(valueTarget)) {
                    const [action, options] = getTransition(key, valueTarget, {
                        delay,
                        ...transition,
                    })
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

            setValues(transitionEnd, this.values)
        })
    }

    private animateVariantLabels(variantLabels: string[]) {
        const animations = [...variantLabels].reverse().map(label => this.animateVariant(label))
        return Promise.all(animations)
    }

    private animateVariant(variantLabel: string, delay: number = 0): Promise<any> {
        let beforeChildren = false
        let afterChildren = false
        let delayChildren = 0
        let staggerChildren = 0
        let staggerDirection = 1

        const variant = this.variants[variantLabel]
        const getAnimations: () => Promise<any> = variant ? () => this.animate(variant, delay) : () => Promise.resolve()
        const getChildrenAnimations: () => Promise<any> = this.children
            ? () => this.animateChildren(variantLabel, delayChildren, staggerChildren, staggerDirection)
            : () => Promise.resolve()

        if (variant && this.children) {
            const { transition } = resolveVariant(variant)
            if (transition) {
                beforeChildren = transition.beforeChildren || beforeChildren
                afterChildren = transition.afterChildren || afterChildren
                delayChildren = transition.delayChildren || delayChildren
                staggerChildren = transition.staggerChildren || staggerChildren
                staggerDirection = transition.staggerDirection || staggerDirection
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
        staggerDirection: number = 1
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
            const animation = childControls.animateVariant(variantLabel, delayChildren + generateStaggerDuration(i))
            animations.push(animation)
        })

        return Promise.all(animations)
    }

    private resetIsAnimating() {
        this.isAnimating.clear()
        if (this.children) {
            this.children.forEach(child => child.resetIsAnimating())
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
    const parentControls = useContext(MotionContext).controls
    const controls = useMemo(() => new AnimationControls<P>(values, ref), [])

    // Reset and resubscribe children every render to ensure stagger order is correct
    controls.resetChildren()

    if (inherit && parentControls) {
        parentControls.addChild(controls)
    }

    useEffect(() => () => parentControls && parentControls.removeChild(controls), [])

    controls.setProps(props)

    return controls
}
