import { Ref, CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationManager } from "../animation"
import { Variants, Target, Transition, TargetAndTransition } from "../types"
import { GestureHandlers } from "../gestures"
import { DraggableProps } from "../behaviours"

export type MotionStyleProp = string | number | MotionValue

export type VariantLabels = string | string[]

export interface MotionStyleProperties {
    x?: MotionStyleProp
    y?: MotionStyleProp
    z?: MotionStyleProp
    rotate?: MotionStyleProp
    rotateX?: MotionStyleProp
    rotateY?: MotionStyleProp
    rotateZ?: MotionStyleProp
    scale?: MotionStyleProp
    scaleX?: MotionStyleProp
    scaleY?: MotionStyleProp
    scaleZ?: MotionStyleProp
    skew?: MotionStyleProp
    skewX?: MotionStyleProp
    skewY?: MotionStyleProp
    originX?: MotionStyleProp
    originY?: MotionStyleProp
    originZ?: MotionStyleProp
    perspective?: MotionStyleProp
}

export type MakeMotion<T> = { [K in keyof T]: T[K] | MotionValue<T[K]> } &
    MotionStyleProperties

export type MotionStyle = MakeMotion<CSSProperties>

export type OnUpdate = (v: Target) => void
export interface MotionProps extends GestureHandlers, DraggableProps {
    ref?: Ref<Element>
    style?: MotionStyle
    animate?: AnimationManager | TargetAndTransition | VariantLabels
    initial?: Target | VariantLabels
    variants?: Variants
    transition?: Transition
    inherit?: boolean
    onUpdate?: OnUpdate
    render?: boolean
    onAnimationComplete?: () => void
    [key: string]: any
}

export enum AnimatePropType {
    Target = "Target",
    VariantLabel = "VariantLabel",
    AnimationSubscription = "AnimationSubscription",
}
