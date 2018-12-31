import { Transition } from "../motion/types"

const underDampedSpring = () => ({
    type: "spring",
    stiffness: 500,
    damping: 25,
    restDelta: 0.5,
    restSpeed: 10,
})

const overDampedSpring = (to: string | number) => ({
    type: "spring",
    stiffness: 700,
    damping: to === 0 ? 100 : 35,
})

const linearTween = () => ({
    ease: "linear",
    duration: 250,
})

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

export const getDefaultTransition = (valueKey: string, to: string | number): Transition => {
    const transitionFactory = defaultTransitions[valueKey] || defaultTransitions.default
    return { ...transitionFactory(to), to }
}
