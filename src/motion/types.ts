import { CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationGroupControls } from "../animation/AnimationGroupControls"
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
    /**
     * Supports `MotionValue`s and separate `transform` values.
     */
    style?: MotionStyle

    /**
     * Either properties to animate to, variant label, array of variant labels, or `AnimationController`
     */
    animate?: AnimationGroupControls | TargetAndTransition | VariantLabels

    /**
     * Properties, variant label or array of variant labels to start in
     */
    initial?: Target | VariantLabels

    /**
     * Object of variants
     */
    variants?: Variants

    /**
     * Default transition
     */
    transition?: Transition

    /**
     * Set to `false` to prevent inheriting variant changes from a parent `motion` component.
     * @default true
     */
    inherit?: boolean

    /**
     * Set to `false` to block rendering the latest motion values on the component - can be used to temporarily disable animations for performance reasons.
     * @default true
     */
    render?: boolean

    /**
     * Callback with latest motion values, fired max once per frame
     */
    onUpdate?: OnUpdate

    /**
     * Callback when animation defined in `animate` is complete
     */
    onAnimationComplete?: () => void
    [key: string]: any
}

export enum AnimatePropType {
    Target = "Target",
    VariantLabel = "VariantLabel",
    AnimationSubscription = "AnimationSubscription",
}
