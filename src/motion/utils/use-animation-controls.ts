import { useMemo, useEffect, useContext } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue, MotionValue } from "../../value"
import { complex } from "style-value-types"
import { transformPose } from "../../dom/unit-type-conversion"
import { MotionContext } from "./MotionContext"
import { PoseResolver, Pose, PoseTransition, Props } from "types"

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)

// export class AnimationControls {
//     private animator: any
//     private values: MotionValuesMap
//     private props: { [key: string]: any }
//     private children = new Set<AnimationControls>()

//     constructor(animator, values) {
//         this.animator = animator
//         this.values = values
//     }

//     set(def) {
//         if (typeof def === "function") {
//             def = def(this.props)
//         }

//         // TODO resolve pose as string

//         const { transition, options, ...values } = def
//         Object.keys(values).forEach(key => {
//             if (!this.values.has(key)) {
//                 this.values.set(key, motionValue(values[key]))
//             } else {
//                 this.values.get(key).set(values[key])
//             }
//         })
//     }

//     start(def) {
//         let getChildrenAnimations = () => []

//         if (typeof def === "function") {
//             def = def(this.props)
//         }

//         if (typeof def === "string") {
//             const pose = def
//             getChildrenAnimations = () => {
//                 const animations = []
//                 this.children.forEach(child => animations.push(child.start(pose)))
//                 return animations
//             }

//             def = this.animator.getPose(def)
//         }

//         if (!def) return

//         const { transition = {}, options, transitionEnd, ...values } = def
//         const { beforeChildren, afterChildren } = transition
// getanimations

//         let animations

//         if (this.children.size && (beforeChildren || afterChildren)) {
//             const [first, last] = beforeChildren
//                 ? [getAnimations, getChildrenAnimations]
//                 : [getChildrenAnimations, getAnimations]

//             animations = Promise.all(first()).then(() => Promise.all(last()))
//         } else {
//             animations = Promise.all([...getAnimations(), ...getChildrenAnimations()])
//         }

//         return animations.then(() => {
//             if (!transitionEnd) return

//             Object.keys(transitionEnd).forEach(key => {
//                 if (this.values.has(key)) {
//                     this.values.get(key).set(transitionEnd[key])
//                 }
//             })
//         })
//     }

//     stop() {
//         this.values.forEach(value => value.stop())
//     }

//     setProps(props = {}) {
//         this.props = props
//     }

//     addChild(controls: AnimationControls) {
//         this.children.add(controls)
//     }

//     removeChild(controls: AnimationControls) {
//         this.children.delete(controls)
//     }
// }

const isPoseResolver = (p: any): p is PoseResolver => typeof p === "function"

const resolveTargetAndTransition = (to: Pose | PoseResolver, options: PoseTransition, props: Props) => {
    if (isPoseResolver(to)) {
        const resolved = to(props)
        return Array.isArray(resolved) ? resolved : [resolved]
    } else {
        return [to, options]
    }
}

const setValue = (values: MotionValuesMap, key: string, v: any) => {
    if (values.has(key)) {
        const value = values.get(key)
        value && value.set(v)
    } else {
        values.set(key, motionValue(v))
    }
}

export class AnimationControls<P = {}> {
    private props: P
    private values: MotionValuesMap

    constructor(values: MotionValuesMap) {
        this.values = values
    }

    setProps(props: P) {
        this.props = props
    }

    set(to: PoseResolver): Promise<any>
    set(to: Pose, options?: PoseTransition): Promise<any>
    set(to: Pose | PoseResolver, options: PoseTransition = {}): Promise<any> {
        const [target] = resolveTargetAndTransition(to, options, this.props)
        Object.keys(target).forEach(key => setValue(this.values, key, target[key]))
    }

    start(to: PoseResolver): Promise<any>
    start(to: Pose, options?: PoseTransition): Promise<any>
    start(to: Pose | PoseResolver, options: PoseTransition = {}): Promise<any> {
        const [target, transition] = resolveTargetAndTransition(to, options, this.props)

        const getAnimations = () => {
            const animations = Object.keys(target).reduce(
                (acc, key) => {
                    const valueTarget = target[key]

                    if (!this.values.has(key)) {
                        this.values.set(key, motionValue(0)) // TODO properly get this property
                    }

                    const value = this.values.get(key)
                    if (!value) return acc

                    if (isAnimatable(valueTarget)) {
                        const [action, options] = getTransition(key, valueTarget, transition)
                        acc.push(value.control(action, options))
                    } else {
                        value.set(valueTarget)
                    }

                    return acc
                },
                [] as Promise<any>[]
            )

            return Promise.all(animations).then(() => {
                const { applyOnEnd } = transition
                if (!applyOnEnd) return

                Object.keys(applyOnEnd).forEach(key => setValue(this.values, key, applyOnEnd[key]))
            })
        }

        return getAnimations()
    }

    stop() {}
}

export const useAnimationControls = <P>(values: MotionValuesMap, props: P) => {
    const controls = useMemo(() => new AnimationControls<P>(values), [])
    controls.setProps(props)
    return controls
}

// export const useAnimationControls = (animator, values, props) => {
//     const parentControls = useContext(MotionContext).controls
//     const controls = useMemo(() => new AnimationControls(animator, values), [])

//     controls.setProps(props)

//     // Unsubscribe from animator on unmount
//     useEffect(
//         () => {
//             animator.subscribe(controls)

//             if (inheritPose && parentControls) {
//                 parentControls.addChild(controls)
//             }

//             return () => {
//                 animator.unsubscribe(controls)

//                 if (inheritPose && parentControls) {
//                     parentControls.removeChild(controls)
//                 }
//             }
//         },
//         [inheritPose, animator]
//     )

//     return controls
// }
