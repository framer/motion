import { useMemo, useEffect, useContext } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue } from "../../value"
import { complex } from "style-value-types"
import { transformPose } from "../../dom/unit-type-conversion"
import { MotionContext } from "./MotionContext"

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)

export class AnimationControls {
    private animator: any
    private values: MotionValuesMap
    private props: { [key: string]: any }
    private children = new Set<AnimationControls>()

    constructor(animator, values) {
        this.animator = animator
        this.values = values
    }

    set(def) {
        if (typeof def === "function") {
            def = def(this.props)
        }

        // TODO resolve pose as string

        const { transition, options, ...values } = def
        Object.keys(values).forEach(key => {
            if (!this.values.has(key)) {
                this.values.set(key, motionValue(values[key]))
            } else {
                this.values.get(key).set(values[key])
            }
        })
    }

    start(def) {
        let getChildrenAnimations = () => []

        if (typeof def === "function") {
            def = def(this.props)
        }

        if (typeof def === "string") {
            const pose = def
            getChildrenAnimations = () => {
                const animations = []
                this.children.forEach(child => animations.push(child.start(pose)))
                return animations
            }

            def = this.animator.getPose(def)
        }

        if (!def) return

        const { transition = {}, options, transitionEnd, ...values } = def
        const { beforeChildren, afterChildren } = transition
        const getAnimations = () => {
            return Object.keys(values).reduce(
                (acc, key) => {
                    const value = values[key]

                    if (!this.values.has(key)) {
                        this.values.set(key, motionValue(0)) // TODO get this properly
                    }

                    if (isAnimatable(value)) {
                        const [action, opts] = getTransition(key, value, transition || options)
                        acc.push(this.values.get(key).control(action, opts))
                    } else {
                        this.values.get(key).set(values[key])
                    }

                    return acc
                },
                [] as Promise<any>[]
            )
        }

        let animations

        if (this.children.size && (beforeChildren || afterChildren)) {
            const [first, last] = beforeChildren
                ? [getAnimations, getChildrenAnimations]
                : [getChildrenAnimations, getAnimations]

            animations = Promise.all(first()).then(() => Promise.all(last()))
        } else {
            animations = Promise.all([...getAnimations(), ...getChildrenAnimations()])
        }

        return animations.then(() => {
            if (!transitionEnd) return

            Object.keys(transitionEnd).forEach(key => {
                if (this.values.has(key)) {
                    this.values.get(key).set(transitionEnd[key])
                }
            })
        })
    }

    stop() {
        this.values.forEach(value => value.stop())
    }

    setProps(props = {}) {
        this.props = props
    }

    addChild(controls: AnimationControls) {
        this.children.add(controls)
    }

    removeChild(controls: AnimationControls) {
        this.children.delete(controls)
    }
}

export const useAnimationControls = (animator, values, inheritPose, props) => {
    const parentControls = useContext(MotionContext).controls
    const controls = useMemo(() => new AnimationControls(animator, values), [])

    controls.setProps(props)

    // Unsubscribe from animator on unmount
    useEffect(
        () => {
            animator.subscribe(controls)

            if (inheritPose && parentControls) {
                parentControls.addChild(controls)
            }

            return () => {
                animator.unsubscribe(controls)

                if (inheritPose && parentControls) {
                    parentControls.removeChild(controls)
                }
            }
        },
        [inheritPose, animator]
    )

    return controls
}
