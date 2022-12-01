import { EasingFunction } from "../../easing/types"

export interface Animation<V> {
    next: (t: number) => {
        value: V
        done: boolean
    }
    // TODO Change this mutative approach for a factory
    flipTarget: () => void
}

export interface AnimationState<V> {
    value: V
    done: boolean
}

export interface PlaybackControls {
    stop: () => void
}

/**
 * An update function. It accepts a timestamp used to advance the animation.
 */
type Update = (timestamp: number) => void

/**
 * Drivers accept a update function and call it at an interval. This interval
 * could be a synchronous loop, a setInterval, or tied to the device's framerate.
 */
export interface DriverControls {
    start: () => void
    stop: () => void
}
export type Driver = (update: Update) => DriverControls

/**
 * Playback options common to all animations.
 */
export interface PlaybackOptions<V> {
    /**
     * Whether to autoplay the animation when animate is called. If
     * set to false, the animation must be started manually via the returned
     * play method.
     */
    autoplay?: boolean

    driver?: Driver
    elapsed?: number
    from?: V
    repeat?: number
    repeatType?: "loop" | "reverse" | "mirror"
    repeatDelay?: number
    type?: "spring" | "decay" | "keyframes"
    onUpdate?: (latest: V) => void
    onPlay?: () => void
    onComplete?: () => void
    onRepeat?: () => void
    onStop?: () => void
}

export interface KeyframeOptions<V = number> {
    to: V | V[]
    from?: V
    duration?: number
    ease?: EasingFunction | EasingFunction[]
    offset?: number[]
}

export interface DecayOptions {
    from?: number
    to?: number
    velocity?: number
    power?: number
    timeConstant?: number
    modifyTarget?: (target: number) => number
    restDelta?: number
}

export interface PhysicsSpringOptions {
    velocity: number
    stiffness: number
    damping: number
    mass: number
}

export interface SpringOptions extends Partial<PhysicsSpringOptions> {
    from?: number
    to?: number
    duration?: number
    bounce?: number
    restSpeed?: number
    restDelta?: number
}

export interface InertiaOptions extends DecayOptions {
    bounceStiffness?: number
    bounceDamping?: number
    min?: number
    max?: number
    restSpeed?: number
    restDelta?: number
    driver?: Driver
    onUpdate?: (v: number) => void
    onComplete?: () => void
    onStop?: () => void
}

export type AnimationOptions<V> = PlaybackOptions<V> &
    (DecayOptions | KeyframeOptions<V> | SpringOptions)
