import {
    PopmotionTransitionProps,
    ValueTarget,
    KeyframesTarget,
    SingleTarget,
    Keyframes,
} from "../../types"
import { isKeyframesTarget } from "./is-keyframes-target"

export const underDampedSpring = () => ({
    type: "spring",
    stiffness: 500,
    damping: 25,
    restDelta: 0.5,
    restSpeed: 10,
})

export const overDampedSpring = (to: SingleTarget) => ({
    type: "spring",
    stiffness: 550,
    damping: to === 0 ? 100 : 30,
    restDelta: 0.01,
    restSpeed: 10,
})

export const linearTween = () => ({
    type: "keyframes",
    ease: "linear",
    duration: 0.3,
})

const keyframes = (values: KeyframesTarget): Partial<Keyframes> => ({
    type: "keyframes",
    duration: 0.8,
    values,
})

type TransitionFactory = (to: ValueTarget) => Partial<PopmotionTransitionProps>

const defaultTransitions = {
    x: underDampedSpring,
    y: underDampedSpring,
    z: underDampedSpring,
    rotate: underDampedSpring,
    rotateX: underDampedSpring,
    rotateY: underDampedSpring,
    rotateZ: underDampedSpring,
    scaleX: overDampedSpring,
    scaleY: overDampedSpring,
    scale: overDampedSpring,
    opacity: linearTween,
    backgroundColor: linearTween,
    color: linearTween,
    default: overDampedSpring,
}

export const getDefaultTransition = (
    valueKey: string,
    to: ValueTarget
): PopmotionTransitionProps => {
    let transitionFactory: TransitionFactory

    if (isKeyframesTarget(to)) {
        transitionFactory = keyframes
    } else {
        transitionFactory =
            defaultTransitions[valueKey] || defaultTransitions.default
    }

    return { to, ...transitionFactory(to) } as PopmotionTransitionProps
}
