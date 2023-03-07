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
