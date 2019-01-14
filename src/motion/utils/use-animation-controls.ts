import { useMemo, useEffect, useContext } from "react"
import { MotionValuesMap } from "./use-motion-values"
import { getTransition } from "./transitions"
import { motionValue } from "../../value"
import { complex } from "style-value-types"
import { MotionContext } from "./MotionContext"
import { PoseResolver, Pose, PoseTransition, Props, Poses, PoseDefinition } from "../../types"

const isAnimatable = (value: string | number) => typeof value === "number" || complex.test(value)
const isPoseResolver = (p: any): p is PoseResolver => typeof p === "function"
const isPoseKeyList = (v: any): v is string[] => Array.isArray(v)

const setValues = (target: Pose, values: MotionValuesMap, isActive: Set<string> = new Set()) => {
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

const resolveAnimationDefinition = (definition?: Pose, props: Props = {}): [PoseDefinition?, PoseTransition?] => {
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
    private children?: Set<AnimationControls>
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

    start(definition: string | string[] | PoseDefinition | PoseResolver, transition?: PoseTransition): Promise<any> {
        this.resetIsAnimating()

        if (isPoseKeyList(definition)) {
            return this.animateMultiplePoses(definition)
        } else if (typeof definition === "string") {
            return this.animatePose(definition)
        } else {
            return this.animate([definition, transition] as Pose)
        }
    }

    set(poseKeyList: string[]) {
        const isSetting: Set<string> = new Set()
        const reversedList = [...poseKeyList].reverse()
        reversedList.forEach(poseKey => {
            const [target, transition] = resolveAnimationDefinition(this.poses[poseKey], this.props)

            if (transition) {
                const { applyOnEnd } = transition
                applyOnEnd && setValues(applyOnEnd, this.values, isSetting)
            }

            target && setValues(target, this.values, isSetting)
        })
    }

    private animate(animationDefinition: Pose, delay: number = 0) {
        const [target, transition = {}] = resolveAnimationDefinition(animationDefinition)

        if (!target) return Promise.resolve()

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
            if (!transition || !transition.applyOnEnd) return
            const { applyOnEnd } = transition

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
            const [first, last] = beforeChildren
                ? [getAnimations, getChildrenAnimations]
                : [getChildrenAnimations, getAnimations]
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
        if (!this.children) {
            return
        }
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
