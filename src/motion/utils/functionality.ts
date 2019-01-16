import { MotionProps } from "motion/types"
import { AnimationManager } from "../../animation"
import { Poses } from "../../types"
import { useAnimationSubscription } from "./use-animation-subscription"
import { usePoses } from "./use-poses"
import { useGestures } from "../../gestures"
import { useDraggable } from "../../behaviours"
import { createElement, ComponentType, RefObject, CSSProperties } from "react"
import { buildStyleAttr } from "./style-attr"
import { MotionValuesMap } from "./use-motion-values"

// TODO: We can tidy this up. There's probably a neater or more consistent way to structure this.

const gestureProps = ["dragEnabled", "onPan", "onPanStart", "onPanEnd", "onTap"]

export const isGesturesEnabled = (props: MotionProps) => gestureProps.some(key => props.hasOwnProperty(key))
export const isDragEnabled = (props: MotionProps) => !!props.dragEnabled
export const isAnimationSubscription = (animate: any): animate is AnimationManager => {
    return animate instanceof AnimationManager
}

export const isPosed = (animate: any): animate is Poses => animate !== undefined && !isAnimationSubscription(animate)

const makeHookComponent = (hook: Function) => (p: any) => {
    hook(p)
    return null
}

export const AnimationSubscription = makeHookComponent((p: any) => useAnimationSubscription(p.animate, p.controls))
export const Posed = makeHookComponent(({ animate, inherit, controls, onPoseComplete, pose, initialPose }: any) =>
    usePoses(animate, inherit, controls, onPoseComplete, pose, initialPose)
)
export const Gestures = makeHookComponent(({ innerRef, ...props }: any) => useGestures(props, innerRef))
export const Draggable = makeHookComponent(({ innerRef, values, ...props }: any) =>
    useDraggable(props, innerRef, values)
)

type RenderProps<P> = {
    base: string | ComponentType<P>
    remainingProps: { [key: string]: any }
    innerRef: RefObject<Element | null>
    style: CSSProperties
    values: MotionValuesMap
}

export const RenderComponent = <P>({ base, remainingProps, innerRef, style, values }: RenderProps<P>) => {
    return createElement<any>(base, {
        ...remainingProps,
        ref: innerRef,
        style: buildStyleAttr(values, style),
    })
}
