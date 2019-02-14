import { CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationGroupControls } from "../animation/AnimationGroupControls"
import {
    Variants,
    Target,
    Transition,
    TargetAndTransition,
    Omit,
} from "../types"
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

export type MakeMotion<T> = MotionStyleProperties &
    { [K in keyof T]: T[K] | MotionValue<T[K]> }

export type MotionStyle = MakeMotion<
    Omit<CSSProperties, "rotate" | "scale" | "perspective">
>

export type OnUpdate = (v: Target) => void

/**
 * @public
 */
export interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationGroupControls`
     *
     * ```jsx
     * // As values
     * <motion.div animate={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div animate="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div animate={["visible", "active"]} variants={variants} />
     *
     * // `AnimationGroupControls`
     * <motion.div animate={animation} />
     * ```
     */
    animate?: AnimationGroupControls | TargetAndTransition | VariantLabels

    /**
     * Object of labelled variants.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *     backgroundColor: '#f00'
     *   },
     *   inactive: {
     *     backgroundColor: '#fff',
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * return <motion.div variants={variants} animate="active" />
     * ```
     */
    variants?: Variants

    /**
     * Default transition, to fall back on if no `transition` is defined in `animate`.
     *
     * ```jsx
     * const transition = {
     *   type: 'spring',
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <motion.div transition={transition} animate={{ scale: 1.2 }} />
     * ```
     */
    transition?: Transition
}

/**
 * @public
 */
export interface MotionCallbacks {
    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * ```jsx
     * function onUpdate({ x, opacity }) {
     *   // Do something
     * }
     *
     * return <motion.li animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: { [key: string]: string | number }): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * ```jsx
     * function onComplete() {}
     *
     * return <motion.div onAnimationComplete={onComplete} />
     * ```
     */
    onAnimationComplete?(): void
}

/**
 * @public
 */
export interface MotionAdvancedProps {
    /**
     * Set to `false` to prevent inheriting variant changes from a parent
     * `motion` component.
     */
    inherit?: boolean

    /**
     * Set to `false` to block rendering the latest motion values on the
     * component - can be used to temporarily disable animations for
     * performance reasons.
     */
    render?: boolean
}

/**
 * Props for `motion` components.
 *
 * @public
 */
export interface MotionProps
    extends AnimationProps,
        MotionCallbacks,
        GestureHandlers,
        DraggableProps,
        MotionAdvancedProps {
    /**
     * Properties, variant label or array of variant labels to start in
     *
     * ```jsx
     * // As values
     * <motion.div initial={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div initial="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div initial={["visible", "active"]} variants={variants} />
     * ```
     */
    initial?: Target | VariantLabels

    /**
     * The React DOM `style` prop, enhanced with support for `MotionValue`s and separate `transform` values.
     *
     * ```jsx
     * const x = useMotionValue(0)
     *
     * return <motion.div style={{ x, opacity: 1, scale: 0.5 }} />
     * ```
     */
    style?: MotionStyle

    /**
     * @internal
     */
    [key: string]: any
}

export enum AnimatePropType {
    Target = "Target",
    VariantLabel = "VariantLabel",
    AnimationSubscription = "AnimationSubscription",
}
