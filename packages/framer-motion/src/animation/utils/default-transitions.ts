import { AnimationOptions } from "../types"

export const underDampedSpring = () => ({
    type: "spring",
    stiffness: 500,
    damping: 25,
    restSpeed: 10,
})

export const criticallyDampedSpring = (target: unknown) => ({
    type: "spring",
    stiffness: 550,
    damping: target === 0 ? 2 * Math.sqrt(550) : 30,
    restSpeed: 10,
})

export const linearTween = () => ({
    type: "keyframes",
    ease: "linear",
    duration: 0.3,
})

const keyframesTransition: Partial<AnimationOptions> = {
    type: "keyframes",
    duration: 0.8,
}

const defaultTransitions = {
    x: underDampedSpring,
    y: underDampedSpring,
    z: underDampedSpring,
    rotate: underDampedSpring,
    rotateX: underDampedSpring,
    rotateY: underDampedSpring,
    rotateZ: underDampedSpring,
    scaleX: criticallyDampedSpring,
    scaleY: criticallyDampedSpring,
    scale: criticallyDampedSpring,
    opacity: linearTween,
    backgroundColor: linearTween,
    color: linearTween,
    default: criticallyDampedSpring,
}

export const getDefaultTransition = (
    valueKey: string,
    { keyframes }: AnimationOptions
): Partial<AnimationOptions> => {
    if (keyframes.length > 2) {
        return keyframesTransition
    } else {
        const factory =
            defaultTransitions[valueKey] || defaultTransitions.default
        return factory(keyframes[1])
    }
}
