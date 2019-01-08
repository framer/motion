import { useMemo, useEffect, useContext } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue } from "../../value"
import { complex } from "style-value-types"
import { transformPose } from "../../dom/unit-type-conversion"
import { MotionContext } from "./MotionContext"
import { PoseResolver, Pose, PoseTransition, Props, Poses, PoseDefinition } from "../../types"

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

const isPoseResolver = (p: any): p is PoseResolver => typeof p === "function"

const isPoseKeyList = (v: any): v is string[] => Array.isArray(v)

const setValue = (values: MotionValuesMap, key: string, v: any) => {
    if (values.has(key)) {
        const value = values.get(key)
        value && value.set(v)
    } else {
        values.set(key, motionValue(v))
    }
}

const setValues = (target: Pose, values: MotionValuesMap, isActive: Set<string> = new Set()) => {
    return Object.keys(target).forEach(key => {
        if (isActive.has(key)) return

        isActive.add(key)
        setValue(values, key, target[key])
    })
}

const resolveAnimationDefinition = (definition?: Pose | PoseResolver, props: Props = {}) => {
    if (!definition) return []

    if (isPoseResolver(definition)) {
        definition = definition(props)
    }

    return Array.isArray(definition) ? definition : [definition]
}

export class AnimationControls<P = {}> {
    private props: P
    private values: MotionValuesMap
    private poses: Poses = {}
    private children: Set<AnimationControls>
    private isAnimating: Set<string> = new Set()

    constructor(values: MotionValuesMap) {
        this.values = values
    }

    setProps(props: P) {
        this.props = props
    }

    setPoses(poses: Poses) {
        this.poses = poses
    }

    start(poseKey: string): Promise<any>
    start(poseList: string[]): Promise<any>
    start(target: PoseDefinition, transition?: PoseTransition): Promise<any>
    start(resolver: PoseResolver): Promise<any>
    start(definition: string | string[] | PoseDefinition | PoseResolver, transition?: PoseTransition): Promise<any> {
        this.resetIsAnimating()

        if (isPoseKeyList(definition)) {
            return this.animateMultiplePoses(definition)
        } else if (typeof definition === "string") {
            return this.animatePose(definition)
        } else {
            return this.animate([definition, transition])
        }
    }

    set(poseKeyList: string[]) {
        const isSetting: Set<string> = new Set()
        const reversedList = [...poseKeyList].reverse()
        reversedList.forEach(poseKey => {
            const [target] = resolveAnimationDefinition(this.poses[poseKey], this.props)
            target && setValues(target, this.values, isSetting)
        })
    }

    private animate(animationDefinition, delay: number = 0) {
        const [target, transition = {}] = resolveAnimationDefinition(animationDefinition)
        const animations = Object.keys(target).reduce(
            (acc, key) => {
                if (this.isAnimating.has(key)) return acc

                if (!this.values.has(key)) {
                    this.values.set(key, motionValue(0)) // TODO get this initial value properly
                }

                const value = this.values.get(key)
                if (!value) return acc

                const valueTarget = target[key]

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
            const { applyOnEnd } = transition
            if (!applyOnEnd) return

            setValues(applyOnEnd, this.values)
        })
    }

    private animateMultiplePoses(poseKeyList: string[]) {
        const animations = [...poseKeyList].reverse().map(poseKey => this.animatePose(poseKey))
        return Promise.all(animations)
    }

    private animatePose(poseKey: string, delay: number = 0): Promise<any> {
        let beforeChildren = false
        let afterChildren = false
        let delayChildren = 0
        let staggerChildren = 0
        let staggerDirection = 1

        const pose = this.poses[poseKey]
        const getAnimations: () => Promise<any> = pose ? () => this.animate(pose, delay) : () => Promise.resolve()
        const getChildrenAnimations: () => Promise<any> = this.children
            ? () => this.animateChildren(poseKey, delayChildren, staggerChildren, staggerDirection)
            : () => Promise.resolve()

        if (pose && this.children) {
            const [, transition] = resolveAnimationDefinition(pose)
            if (transition) {
                beforeChildren = transition.beforeChildren || beforeChildren
                afterChildren = transition.afterChildren || afterChildren
                delayChildren = transition.delayChildren || delayChildren
            }
        }

        if (beforeChildren || afterChildren) {
            const first = beforeChildren ? getAnimations : getChildrenAnimations
            const last = beforeChildren ? getChildrenAnimations : getAnimations
            return first().then(last)
        } else {
            return Promise.all([getAnimations(), getChildrenAnimations()])
        }
    }

    private animateChildren(
        poseKey: string,
        delayChildren: number = 0,
        staggerChildren: number = 0,
        staggerDirection: number = 1
    ) {
        const animations: Array<Promise<any>> = []

        const maxStaggerDuration = (this.children.size - 1) * staggerChildren
        const generateStaggerDuration =
            staggerDirection === 1
                ? (i: number) => i * staggerChildren
                : (i: number) => maxStaggerDuration - i * staggerChildren

        Array.from(this.children).forEach((childControls, i) => {
            const animation = childControls.animatePose(poseKey, delayChildren + generateStaggerDuration(i))
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
        this.children.delete(controls)
    }

    resetChildren() {
        if (this.children) this.children.clear()
    }
}

export const useAnimationControls = <P>(values: MotionValuesMap, inherit: boolean, props: P) => {
    const parentControls = useContext(MotionContext).controls
    const controls = useMemo(() => new AnimationControls<P>(values), [])

    // Reset and resubscribe children every render to ensure stagger order is correct
    controls.resetChildren()
    if (inherit && parentControls) {
        parentControls.addChild(controls)
    }

    useEffect(() => () => parentControls && parentControls.removeChild(controls), [])

    controls.setProps(props)
    return controls
}
