import { CSSProperties } from "react"

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
 * @public
 */
export interface Orchestration {
    /**
     * Delay the animation by this duration (in seconds). Defaults to `0`.
     *
     * ```jsx
     * const transition = {
     *   delay: 0.2
     * }
     * ```
     *
     * @public
     */
    delay?: number

    /**
     * When using variants, the transition can be scheduled in relation to its children with either:
     *
     *   - `'beforeChildren'` to finish this transition before starting children transitions,
     *   - `'afterChildren'` to finish children transitions before starting this transition.
     *
     * ```jsx
     * const transition = {
     *   when: 'beforeChildren'
     * }
     * ```
     *
     * @public
     * @default false
     */
    when?: false | "beforeChildren" | "afterChildren"

    /**
     * When using variants, children animations will start after this duration (in seconds).
     *
     * @public
     */
    delayChildren?: number

    /**
     * When using variants, children animations can be staggered by this duration (in seconds).
     *
     * For instance, if `staggerChildren` is `0.01`, the first child will be delayed by `0` seconds, the second by `0.01`, the third by `0.02` and so on.
     *
     * The calculated stagger delay will be added to `delayChildren`.
     *
     * @public
     */
    staggerChildren?: number

    /**
     * The direction in which to stagger children.
     *
     *  - `1` staggers from the first child to the last,
     *  - `-1` staggers from the last child to the first.
     *
     * @public
     */
    staggerDirection?: 1 | -1
}

/**
 * A duration-based animation.
 * @public
 */
export interface Tween {
    /**
     * Set `type` to `'tween'` to use a duration-based tween animation.
     *
     * If any `transition` properties are set, the selected animation will default to tween.
     *
     * @public
     */
    type?: "tween"

    /**
     * The duration of the tween animation.
     *
     * @public
     * @default `0.3`
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
     * The duration of time already elapsed in the animation.
     *
     * @internal
     * @default 0
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
 * @public
 */
export interface Spring {
    /**
     * Set `type` to `'spring'` to animate using spring physics for natural movement.
     *
     * @public
     * @default 'tween'
     */
    type: "spring"

    /**
     * Stiffness of the spring. Higher values will create more sudden movement.
     * @public
     * @default 100
     */
    stiffness?: number

    /**
     * Strength of opposing force. If set to 0, spring will oscillate indefinitely.
     * @public
     * @default 10
     */
    damping?: number

    /**
     * Mass of the moving object. Higher values will result in more lethargic movement.
     * @public
     * @default 1
     */
    mass?: number

    /**
     * End animation if absolute speed (in units per second) drops below this value and delta is smaller than `restDelta`.
     * @public
     * @default 0.01
     */
    restSpeed?: number

    /**
     * End animation if distance to to is below this value and speed is below `restSpeed`. When animation ends, spring gets “snapped” to to.
     * @public
     * @default 0.01
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
 * @public
 */
export interface Inertia {
    /**
     * Set `type` to animate using the inertia animation.
     *
     * This can be used for natural deceleration, for instance with momentum scrolling.
     *
     * @public
     * @default 'tween'
     */
    type: "inertia"

    /**
     * A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.
     *
     * @public
     */
    modifyTarget?(v: number): number

    /**
     * If `min` or `max` is set, this affects the stiffness of the bounce spring. Higher values will create more sudden movement.
     *
     * @public
     * @default 500
     */
    bounceStiffness?: number

    /**
     * If `min` or `max` is set, this affects the damping of the bounce spring. If set to `0`, spring will oscillate indefinitely.
     * @public
     * @default 10
     */
    bounceDamping?: number

    /**
     * Higher power = further target.
     * @public
     * @default 0.8
     */
    power?: number

    /**
     * Adjusting the time constant will change the duration of the deceleration, thereby affecting its feel.
     *
     * @public
     * @default 700
     */
    timeConstant?: number

    /**
     * End animation if distance to to is below this value and speed is below `restSpeed`. When animation ends, spring gets “snapped” to to.
     * @public
     * @default 0.01
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
 * @public
 */
export interface Keyframes {
    /**
     * Set `type` to `'keyframes'` to animate using the keyframes animation.
     *
     * This can be used to animate between a series of values.
     *
     * @public
     * @default 'tween'
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
     * The total duration of the animation.
     *
     * @public
     * @default 0.3
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
     * End animation if absolute speed (in units per second) drops below this value .
     * @public
     * @default 0.01
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

export type Target = CSSPropertiesWithoutTransition & {
    x?: number | string
    y?: number | string
    z?: number | string
    rotate?: number | string
    rotateX?: number | string
    rotateY?: number | string
    rotateZ?: number | string
    scale?: number | string
    scaleX?: number | string
    scaleY?: number | string
    scaleZ?: number | string
    skew?: number | string
    skewX?: number | string
    skewY?: number | string
    originX?: number | string
    originY?: number | string
    originZ?: number | string
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
