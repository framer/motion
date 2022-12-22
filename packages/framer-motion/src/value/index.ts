import { frameData } from "../frameloop/data"
import { FrameData } from "../frameloop/types"
import { sync } from "../frameloop"
import type { VisualElement } from "../render/VisualElement"
import { SubscriptionManager } from "../utils/subscription-manager"
import { velocityPerSecond } from "../utils/velocity-per-second"
import { warning } from "hey-listen"

export type Transformer<T> = (v: T) => T

/**
 * @public
 */
export type Subscriber<T> = (v: T) => void

/**
 * @public
 */
export type PassiveEffect<T> = (v: T, safeSetter: (v: T) => void) => void

export type StartAnimation = (complete: () => void) => () => void

export interface MotionValueEventCallbacks<V> {
    animationStart: () => void
    animationComplete: () => void
    animationCancel: () => void
    change: (latestValue: V) => void
    renderRequest: () => void
    velocityChange: (latestVelocity: number) => void
}

const isFloat = (value: any): value is string => {
    return !isNaN(parseFloat(value))
}

export interface MotionValueOptions {
    owner?: VisualElement
}

/**
 * `MotionValue` is used to track the state and velocity of motion values.
 *
 * @public
 */
export class MotionValue<V = any> {
    /**
     * This will be replaced by the build step with the latest version number.
     * When MotionValues are provided to motion components, warn if versions are mixed.
     */
    version = "__VERSION__"

    /**
     * If a MotionValue has an owner, it was created internally within Framer Motion
     * and therefore has no external listeners. It is therefore safe to animate via WAAPI.
     */
    owner?: VisualElement

    /**
     * The current state of the `MotionValue`.
     *
     * @internal
     */
    private current: V

    /**
     * The previous state of the `MotionValue`.
     *
     * @internal
     */
    private prev: V

    /**
     * Duration, in milliseconds, since last updating frame.
     *
     * @internal
     */
    private timeDelta: number = 0

    /**
     * Timestamp of the last time this `MotionValue` was updated.
     *
     * @internal
     */
    private lastUpdated: number = 0

    /**
     * Add a passive effect to this `MotionValue`.
     *
     * A passive effect intercepts calls to `set`. For instance, `useSpring` adds
     * a passive effect that attaches a `spring` to the latest
     * set value. Hypothetically there could be a `useSmooth` that attaches an input smoothing effect.
     *
     * @internal
     */
    private passiveEffect?: PassiveEffect<V>
    private stopPassiveEffect?: VoidFunction

    /**
     * A reference to the currently-controlling Popmotion animation
     *
     * @internal
     */
    private stopAnimation?: null | (() => void)

    /**
     * Tracks whether this value can output a velocity. Currently this is only true
     * if the value is numerical, but we might be able to widen the scope here and support
     * other value types.
     *
     * @internal
     */
    private canTrackVelocity = false

    /**
     * @param init - The initiating value
     * @param config - Optional configuration options
     *
     * -  `transformer`: A function to transform incoming values with.
     *
     * @internal
     */
    constructor(init: V, options: MotionValueOptions = {}) {
        this.prev = this.current = init
        this.canTrackVelocity = isFloat(this.current)
        this.owner = options.owner
    }

    /**
     * Adds a function that will be notified when the `MotionValue` is updated.
     *
     * It returns a function that, when called, will cancel the subscription.
     *
     * When calling `onChange` inside a React component, it should be wrapped with the
     * `useEffect` hook. As it returns an unsubscribe function, this should be returned
     * from the `useEffect` function to ensure you don't add duplicate subscribers..
     *
     * ```jsx
     * export const MyComponent = () => {
     *   const x = useMotionValue(0)
     *   const y = useMotionValue(0)
     *   const opacity = useMotionValue(1)
     *
     *   useEffect(() => {
     *     function updateOpacity() {
     *       const maxXY = Math.max(x.get(), y.get())
     *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
     *       opacity.set(newOpacity)
     *     }
     *
     *     const unsubscribeX = x.on("change", updateOpacity)
     *     const unsubscribeY = y.on("change", updateOpacity)
     *
     *     return () => {
     *       unsubscribeX()
     *       unsubscribeY()
     *     }
     *   }, [])
     *
     *   return <motion.div style={{ x }} />
     * }
     * ```
     *
     * @param subscriber - A function that receives the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @deprecated
     */
    onChange(subscription: Subscriber<V>): () => void {
        return this.on("change", subscription)
    }

    /**
     * An object containing a SubscriptionManager for each active event.
     */
    private events: {
        [key: string]: SubscriptionManager<any>
    } = {}

    on<EventName extends keyof MotionValueEventCallbacks<V>>(
        eventName: EventName,
        callback: MotionValueEventCallbacks<V>[EventName]
    ) {
        if (!this.events[eventName]) {
            this.events[eventName] = new SubscriptionManager()
        }

        const unsubscribe = this.events[eventName].add(callback)

        if (eventName === "change") {
            return () => {
                unsubscribe()

                /**
                 * If we have no more change listeners by the start
                 * of the next frame, stop active animations.
                 */
                sync.read(() => {
                    if (!this.events.change.getSize()) {
                        this.stop()
                    }
                })
            }
        }

        return unsubscribe
    }

    clearListeners() {
        for (const eventManagers in this.events) {
            this.events[eventManagers].clear()
        }
    }

    /**
     * Attaches a passive effect to the `MotionValue`.
     *
     * @internal
     */
    attach(passiveEffect: PassiveEffect<V>, stopPassiveEffect: VoidFunction) {
        this.passiveEffect = passiveEffect
        this.stopPassiveEffect = stopPassiveEffect
    }

    /**
     * Sets the state of the `MotionValue`.
     *
     * @remarks
     *
     * ```jsx
     * const x = useMotionValue(0)
     * x.set(10)
     * ```
     *
     * @param latest - Latest value to set.
     * @param render - Whether to notify render subscribers. Defaults to `true`
     *
     * @public
     */
    set(v: V, render = true) {
        if (!render || !this.passiveEffect) {
            this.updateAndNotify(v, render)
        } else {
            this.passiveEffect(v, this.updateAndNotify)
        }
    }

    /**
     * Set the state of the `MotionValue`, stopping any active animations,
     * effects, and resets velocity to `0`.
     */
    jump(v: V) {
        this.set(v)
        this.prev = v
        this.stop()
        if (this.stopPassiveEffect) this.stopPassiveEffect()
    }

    setWithVelocity(prev: V, current: V, delta: number) {
        this.set(current)
        this.prev = prev
        this.timeDelta = delta
    }

    updateAndNotify = (v: V, render = true) => {
        this.prev = this.current
        this.current = v

        // Update timestamp
        const { delta, timestamp } = frameData
        if (this.lastUpdated !== timestamp) {
            this.timeDelta = delta
            this.lastUpdated = timestamp
            sync.postRender(this.scheduleVelocityCheck)
        }

        // Update update subscribers
        if (this.prev !== this.current && this.events.change) {
            this.events.change.notify(this.current)
        }

        // Update velocity subscribers
        if (this.events.velocityChange) {
            this.events.velocityChange.notify(this.getVelocity())
        }

        // Update render subscribers
        if (render && this.events.renderRequest) {
            this.events.renderRequest.notify(this.current)
        }
    }

    /**
     * Returns the latest state of `MotionValue`
     *
     * @returns - The latest state of `MotionValue`
     *
     * @public
     */
    get() {
        return this.current
    }

    /**
     * @public
     */
    getPrevious() {
        return this.prev
    }

    /**
     * Returns the latest velocity of `MotionValue`
     *
     * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
     *
     * @public
     */
    getVelocity() {
        // This could be isFloat(this.prev) && isFloat(this.current), but that would be wasteful
        return this.canTrackVelocity
            ? // These casts could be avoided if parseFloat would be typed better
              velocityPerSecond(
                  parseFloat(this.current as any) -
                      parseFloat(this.prev as any),
                  this.timeDelta
              )
            : 0
    }

    /**
     * Schedule a velocity check for the next frame.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private scheduleVelocityCheck = () => sync.postRender(this.velocityCheck)

    /**
     * Updates `prev` with `current` if the value hasn't been updated this frame.
     * This ensures velocity calculations return `0`.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private velocityCheck = ({ timestamp }: FrameData) => {
        if (timestamp !== this.lastUpdated) {
            this.prev = this.current

            if (this.events.velocityChange) {
                this.events.velocityChange.notify(this.getVelocity())
            }
        }
    }

    hasAnimated = false

    /**
     * Registers a new animation to control this `MotionValue`. Only one
     * animation can drive a `MotionValue` at one time.
     *
     * ```jsx
     * value.start()
     * ```
     *
     * @param animation - A function that starts the provided animation
     *
     * @internal
     */
    start(animation: StartAnimation) {
        this.stop()

        return new Promise<void>((resolve) => {
            this.hasAnimated = true
            this.stopAnimation = animation(resolve)

            if (this.events.animationStart) {
                this.events.animationStart.notify()
            }
        }).then(() => {
            if (this.events.animationComplete) {
                this.events.animationComplete.notify()
            }
            this.clearAnimation()
        })
    }

    /**
     * Stop the currently active animation.
     *
     * @public
     */
    stop() {
        if (this.stopAnimation) {
            this.stopAnimation()
            if (this.events.animationCancel) {
                this.events.animationCancel.notify()
            }
        }
        this.clearAnimation()
    }

    /**
     * Returns `true` if this value is currently animating.
     *
     * @public
     */
    isAnimating() {
        return !!this.stopAnimation
    }

    private clearAnimation() {
        this.stopAnimation = null
    }

    /**
     * Destroy and clean up subscribers to this `MotionValue`.
     *
     * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
     * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
     * created a `MotionValue` via the `motionValue` function.
     *
     * @public
     */
    destroy() {
        this.clearListeners()
        this.stop()

        if (this.stopPassiveEffect) {
            this.stopPassiveEffect()
        }
    }
}

export function motionValue<V>(init: V, options?: MotionValueOptions) {
    return new MotionValue<V>(init, options)
}
