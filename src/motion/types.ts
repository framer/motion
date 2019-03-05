import { CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationControls } from "../animation/AnimationControls"
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

// TODO: We're hard-adding these to the types here even though they're
// injected from Framer via a CustomStylePlugin. I'd like to find a way
// to be able to support custom values in the type system via context
// but for now this makes things work.
export interface CustomProperties {
    size?: string | number
    image?: string
}

export type MakeMotion<T> = { [K in keyof T]: T[K] | MotionValue<T[K]> }

export type MotionCSS = MakeMotion<
    Omit<CSSProperties, "rotate" | "scale" | "perspective">
>
export type MotionTransform = MakeMotion<TransformProperties>

export type MotionCustom = MakeMotion<CustomProperties>

/**
 * @public
 */
export type MotionStyle = MotionCSS & MotionTransform & MotionCustom

export type OnUpdate = (v: Target) => void

/**
 * @public
 */
export interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationControls`
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
     * // `AnimationControls`
     * <motion.div animate={animation} />
     * ```
     */
    animate?: AnimationControls | TargetAndTransition | VariantLabels

    /**
     * Object of labelled variants.
     *
     * ```jsx
     * export function MyComponent() {
     *   const variants = {
     *     active: {
     *       backgroundColor: '#f00'
     *    },
     *     inactive: {
     *       backgroundColor: '#fff',
     *       transition: { duration: 2 }
     *     }
     *   }
     *
     *   return <motion.div variants={variants} animate="active" />
     * }
     * ```
     */
    variants?: Variants

    /**
     * Default transition, to fall back on if no `transition` is defined in `animate`.
     *
     * ```jsx
     * export function MyComponent() {
     *   const transition = {
     *     type: 'spring',
     *     damping: 10,
     *     stiffness: 100
     *   }
     *
     *   return <motion.div transition={transition} animate={{ scale: 1.2 }} />
     * }
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
     * export function MyComponent() {
     *   function onUpdate({ x, opacity }) {
     *     console.log(`Latest values: ${x} ${opacity}`)
     *   }
     *
     *   return <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * }
     * ```
     */
    onUpdate?(latest: { [key: string]: string | number }): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * ```jsx
     * export function MyComponent() {
     *   function onComplete() {
     *     console.log(`Animation has completed`)
     *   }
     *
     *   return <motion.div animate={{ x: 100 }} onAnimationComplete={onComplete} />
     * }
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
     * Set to `true` to block rendering motion values (`animate`, gestures etc)
     * on the component.
     *
     * This can be used to temporarily disable animations for performance reasons.
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

    /**
     * @internal
     */
    [key: string]: any
}

export type TransformTemplate = (
    transform: TransformProperties,
    generatedTransform: string
) => string

export enum AnimatePropType {
    Target = "Target",
    VariantLabel = "VariantLabel",
    AnimationSubscription = "AnimationSubscription",
}
