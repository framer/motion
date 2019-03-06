import { CSSProperties } from "react"
import { TransformProperties, CustomStyles } from "./motion/types"

export type Props = { [key: string]: any }

export type EasingFunction = (v: number) => number

export type Easing =
    | [number, number, number, number]
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "circIn"
    | "circOut"
    | "circInOut"
    | "backIn"
    | "backOut"
    | "backInOut"
    | "anticipate"
    | EasingFunction

/**
 * Options for orchestrating the timing of animations.
 *
 * @public
 */
export interface Orchestration {
    /**
     * Delay the animation by this duration (in seconds). Defaults to `0`.
     *
     * @remarks
     * ```javascript
     * const transition = {
     *   delay: 0.2
     * }
     * ```
     *
     * @public
     */
    delay?: number

    /**
     * Describes the relationship between the transition and its children. Set
     * to `false` by default.
     *
     * @remarks
     * When using variants, the transition can be scheduled in relation to its
     * children with either `'beforeChildren'` to finish this transition before
     * starting children transitions, `'afterChildren'` to finish children
     * transitions before starting this transition.
     *
     * ```jsx
     * const container = {
     *   hidden: {
     *     opacity: 0,
     *     // This will ensure all children animations
     *     // finish before this animation starts
     *     transition: { when: 'afterChildren' }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 }
     * }
     *
     * return (
     *   <Frame
     *     variants={container}
     *     animate="hidden"
     *   >
     *     <Frame variants={item} />
     *     <Frame variants={item} />
     *     <Frame variants={item} />
     *   </Frame>
     * )
     * ```
     *
     * @public
     */
    when?: false | "beforeChildren" | "afterChildren"

    /**
     * When using variants, children animations will start after this duration
     * (in seconds).
     *
     * @public
     */
    delayChildren?: number

    /**
     * When using variants, children animations can be staggered by this
     * duration (in seconds).
     *
     * For instance, if `staggerChildren` is `0.01`, the first child will be
     * delayed by `0` seconds, the second by `0.01`, the third by `0.02` and so
     * on.
     *
     * The calculated stagger delay will be added to `delayChildren`.
     *
     * @public
     */
    staggerChildren?: number

    /**
     * The direction in which to stagger children.
     *
     * @remarks
     *
     * A value of `1` staggers from the first child to the last while `-1`
     * staggers from the last child to the first.
     *
     * @public
     */
    staggerDirection?: 1 | -1
}

/**
 * An animation that animates between two values over a specific duration of time.
 *
 * This is the default animation for non-physical values like `color` and `opacity`.
 *
 * @public
 */
export interface Tween {
    /**
     * Set `type` to `'tween'` to use a duration-based tween animation.
     *
     * @remarks
     * If any non-orchestration `transition` values are set without a `type` prop,
     * "tween" is used as the default animation.
     *
     * @public
     */
    type?: "tween"

    /**
     * The duration of the tween animation. Set to `0.3` by default.
     *
     * @public
     */
    duration?: number

    /**
     * The easing function to use. Set either as:
     *
     *   - The name of an inbuilt easing function,
     *   - An array of four numbers to define a cubic bezier curve,
     *   - An easing function, that accepts and returns a value `0-1`.
     *
     * ```jsx
     * const transition = {
     *   ease: [0.17, 0.67, 0.83, 0.67]
     * }
     * ```
     *
     * @public
     */
    ease?:
        | [number, number, number, number]
        | "linear"
        | "easeIn"
        | "easeOut"
        | "easeInOut"
        | "circIn"
        | "circOut"
        | "circInOut"
        | "backIn"
        | "backOut"
        | "backInOut"
        | "anticipate"
        | EasingFunction

    /**
     * The duration of time already elapsed in the animation. Set to `0` by
     * default.
     *
     * @internal
     */
    elapsed?: number

    /**
     * The number of times to loop the animation.
     *
     * Set to `Infinity` for perpetual looping.
     *
     * @public
     */
    loop?: number

    /**
     * The number of times to flip the animation by swapping the `to` and `from` values.
     *
     * Set to `Infinity` for perpetual flipping.
     *
     * @public
     */
    flip?: number

    /**
     * The number of times to reverse the animation.
     *
     * Set to `Infinity` for perpetual reversing.
     *
     * @public
     */
    yoyo?: number

    /**
     * The value to animate from. By default, this is the current state of the `MotionValue`.
     *
     * @public
     */
    from?: number | string

    /**
     * @internal
     */
    to?: number | string

    /**
     * @internal
     */
    velocity?: number

    /**
     * @internal
     */
    delay?: number
}

/**
 * An animation that simulates spring physics for realistic motion.
 *
 * This is the default animation for physical values like `x`, `y`, `scale` and `rotate`.
 *
 * @public
 */
export interface Spring {
    /**
     * Set `type` to `'spring'` to animate using spring physics for natural
     * movement. Set to `'spring'` by default.
     *
     * @public
     */
    type: "spring"

    /**
     * Stiffness of the spring. Higher values will create more sudden movement.
     * Set to `100` by default.
     * @public
     */
    stiffness?: number

    /**
     * Strength of opposing force. If set to 0, spring will oscillate
     * indefinitely. Set to `10` by default.
     * @public
     */
    damping?: number

    /**
     * Mass of the moving object. Higher values will result in more lethargic
     * movement. Set to `1` by default.
     * @public
     */
    mass?: number

    /**
     * End animation if absolute speed (in units per second) drops below this
     * value and delta is smaller than `restDelta`. Set to `0.01` by default.
     * @public
     */
    restSpeed?: number

    /**
     * End animation if distance to to is below this value and speed is below
     * `restSpeed`. When animation ends, spring gets “snapped” to to. Set to
     * `0.01` by default.
     * @public
     */
    restDelta?: number

    /**
     * The value to animate from. By default, this is the current state of the `MotionValue`.
     *
     * @public
     */
    from?: number | string

    /**
     * @internal
     */
    to?: number | string

    /**
     * The initial velocity of the spring. By default this is the current velocity of the `MotionValue`.
     * @public
     */
    velocity?: number

    /**
     * @public
     */
    delay?: number
}

/**
 * An animation that decelerates a value based on its initial velocity,
 * usually used to implement inertial scrolling.
 *
 * Optionally, `min` and `max` boundaries can be defined, and inertia
 * will snap to these with a spring animation.
 *
 * This animation will automatically precalculate a target value,
 * which can be modified with the `modifyTarget` property.
 * This allows you to add snap-to-grid or similar functionality.
 *
 * @public
 */
export interface Inertia {
    /**
     * Set `type` to animate using the inertia animation. Set to `'tween'` by
     * default.
     *
     * @remarks
     *
     * This can be used for natural deceleration, for instance with momentum scrolling.
     *
     * @public
     */
    type: "inertia"

    /**
     * A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.
     *
     * @public
     */
    modifyTarget?(v: number): number

    /**
     * If `min` or `max` is set, this affects the stiffness of the bounce
     * spring. Higher values will create more sudden movement. Set to `500` by
     * default.
     *
     * @public
     */
    bounceStiffness?: number

    /**
     * If `min` or `max` is set, this affects the damping of the bounce spring.
     * If set to `0`, spring will oscillate indefinitely. Set to `10` by
     * default.
     * @public
     */
    bounceDamping?: number

    /**
     * Higher power = further target. Set to `0.8` by default.
     * @public
     */
    power?: number

    /**
     * Adjusting the time constant will change the duration of the
     * deceleration, thereby affecting its feel. Set to `700` by default.
     *
     * @public
     */
    timeConstant?: number

    /**
     * End animation if distance to to is below this value and speed is below
     * `restSpeed`. When animation ends, spring gets “snapped” to to. Set to
     * `0.01` by default.
     * @public
     */
    restDelta?: number

    /**
     * Minimum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as less than this value).
     * @public
     */
    min?: number

    /**
     * Maximum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as more than this value).
     * @public
     */
    max?: number

    /**
     * The value to animate from. By default, this is the current state of the `MotionValue`.
     * @public
     */
    from?: number | string

    /**
     * The initial velocity of the animation. By default this is the current velocity of the `MotionValue`.
     * @public
     */
    velocity?: number

    /**
     * @internal
     */
    delay?: number
}

/**
 * Keyframes tweens between multiple `values`.
 *
 * These tweens can be arranged using the `duration`, `easings`, and `times` properties.
 *
 * @internalremarks
 * We could possibly make the `type` property redundant, if not for all animations
 * then for this one quite easily.
 *
 * @public
 */
export interface Keyframes {
    /**
     * Set `type` to `'keyframes'` to animate using the keyframes animation.
     * Set to `'tween'` by default.
     *
     * @remarks
     *
     * This can be used to animate between a series of values.
     *
     * @public
     */
    type: "keyframes"

    /**
     * An array of values to animate between.
     *
     * ```jsx
     * const transition = {
     *   type: 'keyframes',
     *   backgroundColor: {
     *     values: ['#0f0', '#f00', '#00f']
     *   }
     * }
     * ```
     *
     * @public
     */
    values: number[] | string[]

    /**
     * An array of numbers between 0 and 1, where `1` represents the `total` duration.
     *
     * Each value represents at which point during the animation each item in `values` should be hit, so the array should be the same length as `values`.
     *
     * Defaults to an array of evenly-spread durations.
     *
     * @public
     */
    times: number[]

    /**
     * An array of easing functions for each generated tween, or a single easing function applied to all tweens.
     *
     * This array should be one item less than `values`, as these easings apply to the transitions *between* the `values`.
     *
     * ```jsx
     * const transition = {
     *   type: 'keyframes',
     *   backgroundColor: {
     *     values: ['#0f0', '#f00', '#00f'],
     *     easings: ['circIn', 'circOut']
     *   }
     * }
     * ```
     *
     * @public
     */
    easings?: Easing[]

    /**
     * @internal
     */
    elapsed?: number

    /**
     * The total duration of the animation. Set to `0.3` by default.
     *
     * @public
     */
    duration?: number

    /**
     * The number of times to loop the animation.
     *
     * Set to `Infinity` for perpetual looping.
     *
     * @public
     */
    loop?: number

    /**
     * The number of times to flip the animation by swapping the `to` and `from` values.
     *
     * Set to `Infinity` for perpetual flipping.
     *
     * @public
     */
    flip?: number

    /**
     * The number of times to reverse the animation.
     *
     * Set to `Infinity` for perpetual reversing.
     *
     * @public
     */
    yoyo?: number

    /**
     * @internal
     */
    from?: number | string

    /**
     * @internal
     */
    to?: number | string

    /**
     * @internal
     */
    velocity?: number

    /**
     * @internal
     */
    delay?: number
}

/**
 * An animation that simulates velocity, acceleration, and friction.
 *
 * @public
 */
export interface Physics {
    /**
     * Set `type` to `'physics'` to use an animation that will simulate velocity, friction and acceleration.
     * @public
     */
    type: "physics"

    /**
     * Accelerates `velocity` by this amount every second.
     *
     * ```jsx
     * // `velocity` will be `102` after one second:
     * const transition = {
     *   type: 'physics',
     *   velocity: 100,
     *   acceleration: 2
     * }
     * ```
     *
     * @public
     */
    acceleration?: number

    /**
     * Amount of friction to apply per frame, from `0` to `1`.
     *
     * `0` is no friction, `1` is a total stop.
     * @public
     */
    friction?: number

    /**
     * End animation if absolute speed (in units per second) drops below this
     * value. Set to `0.01` by default.
     * @public
     */
    restSpeed?: number

    /**
     * The value to animate from. By default, this is the current state of the `MotionValue`.
     *
     * @public
     */
    from?: number | string

    /**
     * The initial velocity of the spring. By default this is the current velocity of the `MotionValue`.
     * @public
     */
    velocity?: number

    /**
     * @internal
     */
    delay?: number
}

/**
 * @internal
 */
export interface Just {
    type: "just"
    from?: number | string
    delay?: number
    velocity?: number
}

/**
 * @public
 */
export interface None {
    /**
     * Set `type` to `false` for an instant transition.
     *
     * @public
     */
    type: false

    /**
     * @internal
     */
    from?: number | string

    /**
     * @internal
     */
    delay?: number

    /**
     * @internal
     */
    velocity?: number
}

export type PopmotionTransitionProps =
    | Tween
    | Spring
    | Keyframes
    | Physics
    | Inertia
    | Just

/**
 * @public
 */
export type TransitionDefinition =
    | Tween
    | Spring
    | Keyframes
    | Physics
    | Inertia
    | Just
    | None

export type TransitionMap = Orchestration & {
    [key: string]: TransitionDefinition
}

export type Transition =
    | (Orchestration & TransitionDefinition)
    | (Orchestration & TransitionMap)

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type CSSPropertiesWithoutTransition = Omit<CSSProperties, "transition">

export type Target = CSSPropertiesWithoutTransition &
    TransformProperties &
    CustomStyles & {
        pathLength?: number
        pathSpacing?: number
    }

export type TargetAndTransition = Target & {
    transition?: Transition
    transitionEnd?: Target
}

export type TargetResolver = (
    props: any,
    current: Target,
    velocity: Target
) => TargetAndTransition

export type Variant = TargetAndTransition | TargetResolver

export type Variants = {
    [key: string]: Variant
}
