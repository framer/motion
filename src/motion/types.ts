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
import { DraggableProps } from "../behaviours/types"

export type MotionStyleProp = string | number | MotionValue

/**
 * Either a string, or array of strings, that reference variants defined via the `variants` prop.
 * @public
 */
export type VariantLabels = string | string[]

export interface TransformProperties {
    x?: string | number
    y?: string | number
    z?: string | number
    translateX?: string | number
    translateY?: string | number
    translateZ?: string | number
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

/**
 * @public
 */
export interface SVGPathProperties {
    pathLength?: number
    pathOffset?: number
    pathSpacing?: number
}

export interface CustomStyles {
    /**
     * Framer Library custom prop types. These are not actually supported in Motion - preferably
     * we'd have a way of external consumers injecting supported styles into this library.
     */
    size?: string | number
    radius?: string | number
    shadow?: string
    image?: string
}

export type MakeMotion<T> = MakeCustomValueType<
    {
        [K in keyof T]:
            | T[K]
            | MotionValue<number>
            | MotionValue<string>
            | MotionValue<any> // A permissive type for Custom value types
    }
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
    MakeMotion<SVGPathProperties> &
    MakeCustomValueType<CustomStyles>

export type OnUpdate = (v: Target) => void

/**
 * @public
 */
export interface RelayoutInfo {
    delta: {
        x: number
        y: number
        width: number
        height: number
    }
}

/**
 * @public
 */
export type ResolveLayoutTransition = (
    info: RelayoutInfo
) => Transition | boolean

/**
 * @public
 */
export interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationControls`.
     *
     * @library
     *
     * ```jsx
     * // As values
     * <Frame animate={{ opacity: 1 }} />
     *
     * // As variant
     * <Frame animate="visible" variants={variants} />
     *
     * // Multiple variants
     * <Frame animate={["visible", "active"]} variants={variants} />
     *
     * // AnimationControls
     * <Frame animate={animation} />
     * ```
     *
     * @motion
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
     * A target to animate to when this component is removed from the tree.
     *
     * This component **must** be the first animatable child of an `AnimatePresence` to enable this exit animation.
     *
     * This limitation exists because React doesn't allow components to defer unmounting until after
     * an animation is complete. Once this limitation is fixed, the `AnimatePresence` component will be unnecessary.
     *
     * @library
     *
     * ```jsx
     * import { Frame, AnimatePresence } from 'framer'
     *
     * export function MyComponent(props) {
     *   return (
     *     <AnimatePresence>
     *        {props.isVisible && (
     *          <Frame
     *            initial={{ opacity: 0 }}
     *            animate={{ opacity: 1 }}
     *            exit={{ opacity: 0 }}
     *          />
     *        )}
     *     </AnimatePresence>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * import { AnimatePresence, motion } from 'framer-motion'
     *
     * export const MyComponent = ({ isVisible }) => {
     *   return (
     *     <AnimatePresence>
     *        {isVisible && (
     *          <motion.div
     *            initial={{ opacity: 0 }}
     *            animate={{ opacity: 1 }}
     *            exit={{ opacity: 0 }}
     *          />
     *        )}
     *     </AnimatePresence>
     *   )
     * }
     * ```
     */
    exit?: TargetAndTransition | VariantLabels

    /**
     * Variants allow you to define animation states and organise them by name. They allow
     * you to control animations throughout a component tree by switching a single `animate` prop.
     *
     * Using `transition` options like `delayChildren` and `staggerChildren`, you can orchestrate
     * when children animations play relative to their parent.
     *
     * @library
     *
     * After passing variants to one or more `Frame`'s `variants` prop, these variants
     * can be used in place of values on the `animate`, `initial`, `whileTap` and `whileHover` props.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *     backgroundColor: "#f00"
     *   },
     *   inactive: {
     *     backgroundColor: "#fff",
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * <Frame variants={variants} animate="active" />
     * ```
     *
     * @motion
     *
     * After passing variants to one or more `motion` component's `variants` prop, these variants
     * can be used in place of values on the `animate`, `initial`, `whileTap` and `whileHover` props.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *       backgroundColor: "#f00"
     *   },
     *   inactive: {
     *     backgroundColor: "#fff",
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * <motion.div variants={variants} animate="active" />
     * ```
     */
    variants?: Variants

    /**
     * Default transition. If no `transition` is defined in `animate`, it will use the transition defined here.
     *
     * @library
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <Frame transition={spring} animate={{ scale: 1.2 }} />
     * ```
     *
     * @motion
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

    /**
     * @library
     *
     * When a `Frame` is the child of a `Stack`, the `Stack` is responsible for its layout. This makes it harder
     * for us to know when a `Frame`'s position changes within the `Stack` and make it animate to its new position.
     *
     * By adding `positionTransition` to a `Frame`, it'll automatically animate to its new position in the `Stack`,
     * whether the `Stack` layout has changed or the `Frame` has changed its order within it.
     *
     * It can either be set as a `Transition`, or just `true` to use the default layout transition.
     *
     * ```jsx
     * function MyComponent({ distribution = "space-around" }) {
     *   const spring = {
     *     type: "spring",
     *     damping: 10,
     *     stiffness: 100
     *   }
     *
     *   return (
     *     <Stack distribution={distribution}>
     *       <Frame layoutTransition={spring} />
     *     </Stack>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * If `positionTransition` is defined on a `motion` component, it will automatically animate any changes to its layout
     * using a performant `x`/`y` transform.
     *
     * `positionTransition` can either be set as a `Transition`, or just `true` to use the default position transition, which is a snappy spring.
     *
     * It can also be set as a function that will resolve when the component has changed layout. This function
     * should return either a `Transition`, or `true`. For advanced use-cases where you want the component
     * to visually stay in its previous position, this function can also return `false`. This function will receive
     * the `delta` of the changed layout.
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * // This component will animate position when `isVisible` is toggled.
     * const MyComponent = ({ isOpen }) => {
     *   return (
     *     <motion.div positionTransition={spring} style={{ left: isOpen ? 0 : 100 }} />
     *   )
     * }
     *
     * // This component will animate items to their new position if its place in `items` changes order.
     * const MyComponent = ({ items }) => {
     *   return items.map((item) => (
     *     <motion.div key={item.id} positionTransition={spring} />
     *   ))
     * }
     * ```
     *
     * @public
     */
    positionTransition?: Transition | boolean | ResolveLayoutTransition

    /**
     * @library
     *
     * When a `Frame` is the child of a `Stack`, the `Stack` is responsible for its layout. This makes it
     * difficult for to know when the layout changes and smoothly animate components to their new positions.
     *
     * By adding `layoutTransition` to a child `Frame`, it'll automatically animate to its new position
     * when it moves in the `Stack`, whether the `Stack` layout has changed, or the `Frame` has changed order within it.
     *
     * It can either be set as a `Transition`, or just `true` to use the default layout transition.
     *
     * Animating size with `scale` can introduce visual distortion to the component's children. If unwanted,
     * the `useInvertedScale` function can be used to undo this distortion.
     *
     * ```jsx
     * function MyComponent({ distribution = "space-around" }) {
     *   const spring = {
     *     type: "spring",
     *     damping: 10,
     *     stiffness: 100
     *   }
     *
     *   return (
     *     <Stack distribution={distribution}>
     *       <Frame layoutTransition={spring} />
     *     </Stack>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * If `layoutTransition` is defined on a `motion` component, the component will automatically
     * animate any changes to its position **and** size.
     *
     * It will do so using performant transforms. So if a `motion` component changes position, it'll animate
     * to its new position using `x` and `y`. If it changes size, it'll animate using `scaleX` and `scaleY`.
     *
     * Animating size with `scale` can introduce visual distortion to the component's children. If unwanted,
     * the `useInvertedScale` function can be used to undo this distortion.
     *
     * `layoutTransition` can either be set as a `Transition`, or just `true` to use the default layout transition,
     * which is a smooth `0.8` second ease.
     *
     * It can also be set as a function that will resolve when the component has changed layout. This function
     * should return either a `Transition`, or `true`. For advanced use-cases where you want the component
     * to visually stay in its previous position, this function can also return `false`. This function will receive
     * the `delta` of the changed layout.
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * // This component will animate between sizes when `isVisible` is toggled.
     * const MyComponent = ({ isVisible }) => {
     *   return (
     *     <motion.div layoutTransition={spring}>
     *       {isVisible && <Content />}
     *     </motion.div>
     *   )
     * }
     * ```
     *
     * @beta
     */
    layoutTransition?: Transition | boolean | ResolveLayoutTransition
}

/**
 * @public
 */
export interface MotionCallbacks {
    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * @library
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <Frame animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     *
     * @motion
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
     * Callback when animation defined in `animate` begins.
     *
     * @library
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation completed")
     * }
     *
     * <Frame animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * @library
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <Frame animate={{ x: 100 }} onAnimationComplete={onComplete} />
     * ```
     *
     * @motion
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
     * Custom data to use to resolve dynamic variants differently for each animating component.
     *
     * @library
     *
     * ```jsx
     * const variants = {
     *   visible: (custom) => ({
     *     opacity: 1,
     *     transition: { delay: custom * 0.2 }
     *   })
     * }
     *
     * <Frame custom={0} animate="visible" variants={variants} />
     * <Frame custom={1} animate="visible" variants={variants} />
     * <Frame custom={2} animate="visible" variants={variants} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const variants = {
     *   visible: (custom) => ({
     *     opacity: 1,
     *     transition: { delay: custom * 0.2 }
     *   })
     * }
     *
     * <motion.div custom={0} animate="visible" variants={variants} />
     * <motion.div custom={1} animate="visible" variants={variants} />
     * <motion.div custom={2} animate="visible" variants={variants} />
     * ```
     *
     * @public
     */
    custom?: any

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
     * Properties, variant label or array of variant labels to start in.
     *
     * Set to `false` to initialise with the values in `animate` (disabling the mount animation)
     *
     * @library
     *
     * ```jsx
     * // As values
     * <Frame initial={{ opacity: 1 }} />
     *
     * // As variant
     * <Frame initial="visible" variants={variants} />
     *
     * // Multiple variants
     * <Frame initial={["visible", "active"]} variants={variants} />
     *
     * // As false (disable mount animation)
     * <Frame initial={false} animate={{ opacity: 0 }} />
     * ```
     *
     * @motion
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
     *
     * // As false (disable mount animation)
     * <motion.div initial={false} animate={{ opacity: 0 }} />
     * ```
     */
    initial?: boolean | Target | VariantLabels

    /**
     * @library
     *
     * The React DOM `style` prop, useful for setting CSS properties that aren't explicitly exposed by `Frame` props.
     *
     * ```jsx
     * <Frame style={{ mixBlendMode: "difference" }}  />
     * ```
     *
     * @motion
     *
     * The React DOM `style` prop, enhanced with support for `MotionValue`s and separate `transform` values.
     *
     * ```jsx
     * export const MyComponent = () => {
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
     * @library
     *
     * ```jsx
     * function transformTemplate({ x, rotate }) {
     *   return `rotate(${rotate}deg) translateX(${x}px)`
     * }
     *
     * <Frame x={0} rotate={180} transformTemplate={transformTemplate} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   style={{ x: 0, rotate: 180 }}
     *   transformTemplate={
     *     ({ x, rotate }) => `rotate(${rotate}deg) translateX(${x}px)`
     *   }
     * />
     * ```
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
     * This allows values to be transformed before being animated or set as styles.
     *
     * For instance, this allows custom values in Framer Library like `size` to be converted into `width` and `height`.
     * It also allows us a chance to take a value like `Color` and convert it to an animatable color string.
     *
     * A few structural typing changes need making before this can be a public property:
     * - Allow `Target` values to be appended by user-defined types (delete `CustomStyles` - does `size` throw a type error?)
     * - Extract `CustomValueType` as a separate user-defined type (delete `CustomValueType` and animate a `Color` - does this throw a type error?).
     *
     * @param values -
     *
     * @internal
     */
    transformValues?<V extends any>(values: V): V
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
