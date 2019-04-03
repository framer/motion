import { CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationControls } from "../animation/AnimationControls"
import {
    Variants,
    Target,
    Transition,
    TargetAndTransition,
    Omit,
    MakeCustomValueType,
} from "../types"
import { GestureHandlers } from "../gestures"
import { DraggableProps } from "../behaviours"

export type MotionStyleProp = string | number | MotionValue

export type VariantLabels = string | string[]

export interface TransformProperties {
    x?: string | number
    y?: string | number
    z?: string | number
    rotate?: string | number
    rotateX?: string | number
    rotateY?: string | number
    rotateZ?: string | number
    scale?: string | number
    scaleX?: string | number
    scaleY?: string | number
    scaleZ?: string | number
    skew?: string | number
    skewX?: string | number
    skewY?: string | number
    originX?: string | number
    originY?: string | number
    originZ?: string | number
    perspective?: string | number
}

export interface CustomStyles {
    size?: string | number
    image?: string
}

export type MakeMotion<T> = MakeCustomValueType<
    { [K in keyof T]: T[K] | MotionValue<T[K]> }
>

export type MotionCSS = MakeMotion<
    Omit<CSSProperties, "rotate" | "scale" | "perspective">
>

/**
 * @public
 */
export type MotionTransform = MakeMotion<TransformProperties>

/**
 * @public
 */
export type MotionStyle = MotionCSS &
    MotionTransform &
    MakeCustomValueType<CustomStyles>

export type OnUpdate = (v: Target) => void

/**
 * @public
 */
export interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationControls`.
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
     * // AnimationControls
     * <motion.div animate={animation} />
     * ```
     */
    animate?: AnimationControls | TargetAndTransition | VariantLabels

    /**
     * Object of labelled variants. Variants are visual states that can be defined externally from a `Frame` and passed in via the variants property. This allows variant labels to be used in place of values on the `animate`, `initial`, `whileTap`, and `whileHover` properties.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *       backgroundColor: "#f00"
     *    },
     *    inactive: {
     *       backgroundColor: "#fff",
     *       transition: { duration: 2 }
     *     }
     *   }
     *
     * <motion.div variants={variants} animate="active" />
     * ```
     */
    variants?: Variants

    /**
     * Default transition. If no `transition` is defined in `animate`, it will use the transition defined here.
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <motion.div transition={spring} animate={{ scale: 1.2 }} />
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
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: { [key: string]: string | number }): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationComplete={onComplete} />
     * ```
     */
    onAnimationComplete?(): void
}

/**
 * @public
 */
export interface MotionAdvancedProps {
    /**
     * @internal
     * Set to `false` to prevent inheriting variant changes from its parent.
     */
    inherit?: boolean

    /**
     * @internal
     * Set to `true` to block rendering motion values (`animate`, gestures, etcetera)
     * on the component. This can be used to temporarily disable animations for performance reasons.
     */
    static?: boolean
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
     * @remarks
     * ```jsx
     * export function MyComponent() {
     *   const x = useMotionValue(0)
     *
     *   return <motion.div style={{ x, opacity: 1, scale: 0.5 }} />
     * }
     * ```
     */
    style?: MotionStyle

    /**
     * By default, Framer Motion generates a `transform` property with a sensible transform order. `transformTemplate`
     * can be used to create a different order, or to append/preprend the automatically generated `transform` property.
     *
     * @remarks
     *
     *
     * @param transform - The latest animated transform props.
     * @param generatedTransform - The transform string as automatically generated by Framer Motion
     *
     * @public
     */
    transformTemplate?(
        transform: TransformProperties,
        generatedTransform: string
    ): string
}

export type TransformTemplate = (
    transform: TransformProperties,
    generatedTransform: string
) => string

export enum AnimatePropType {
    Target = "Target", // eslint-disable-line no-shadow
    VariantLabel = "VariantLabel",
    AnimationSubscription = "AnimationSubscription",
}
