import sync, { getFrameData, FrameData } from "framesync"
import { velocityPerSecond } from "popmotion"
import { SubscriptionManager } from "../utils/subscription-manager"

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

const isFloat = (value: any): value is string => {
    return !isNaN(parseFloat(value))
}

/**
 * `MotionValue` is used to track the state and velocity of motion values.
 *
 * @public
 */
export class MotionValue<V = any> {
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
     * Functions to notify when the `MotionValue` updates.
     *
     * @internal
     */
    private updateSubscribers = new SubscriptionManager<Subscriber<V>>()

    /**
     * Functions to notify when the velocity updates.
     *
     * @internal
     */
    public velocityUpdateSubscribers = new SubscriptionManager<
        Subscriber<number>
    >()

    /**
     * Functions to notify when the `MotionValue` updates and `render` is set to `true`.
     *
     * @internal
     */
    private renderSubscribers = new SubscriptionManager<Subscriber<V>>()

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
    constructor(init: V) {
        this.prev = this.current = init
        this.canTrackVelocity = isFloat(this.current)
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
     * @library
     *
     * ```jsx
     * function MyComponent() {
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
     *     const unsubscribeX = x.onChange(updateOpacity)
     *     const unsubscribeY = y.onChange(updateOpacity)
     *
     *     return () => {
     *       unsubscribeX()
     *       unsubscribeY()
     *     }
     *   }, [])
     *
     *   return <Frame x={x} />
     * }
     * ```
     *
     * @motion
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
     *     const unsubscribeX = x.onChange(updateOpacity)
     *     const unsubscribeY = y.onChange(updateOpacity)
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
     * @internalremarks
     *
     * We could look into a `useOnChange` hook if the above lifecycle management proves confusing.
     *
     * ```jsx
     * useOnChange(x, () => {})
     * ```
     *
     * @param subscriber - A function that receives the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @public
     */
    onChange(subscription: Subscriber<V>): () => void {
        return this.updateSubscribers.add(subscription)
    }

    clearListeners() {
        this.updateSubscribers.clear()
    }

    /**
     * Adds a function that will be notified when the `MotionValue` requests a render.
     *
     * @param subscriber - A function that's provided the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @internal
     */
    onRenderRequest(subscription: Subscriber<V>) {
        // Render immediately
        subscription(this.get())
        return this.renderSubscribers.add(subscription)
    }

    /**
     * Attaches a passive effect to the `MotionValue`.
     *
     * @internal
     */
    attach(passiveEffect: PassiveEffect<V>) {
        this.passiveEffect = passiveEffect
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

    updateAndNotify = (v: V, render = true) => {
        this.prev = this.current
        this.current = v

        // Update timestamp
        const { delta, timestamp } = getFrameData()
        if (this.lastUpdated !== timestamp) {
            this.timeDelta = delta
            this.lastUpdated = timestamp
            sync.postRender(this.scheduleVelocityCheck)
        }

        // Update update subscribers
        if (this.prev !== this.current) {
            this.updateSubscribers.notify(this.current)
        }

        // Update velocity subscribers
        if (this.velocityUpdateSubscribers.getSize()) {
            this.velocityUpdateSubscribers.notify(this.getVelocity())
        }

        // Update render subscribers
        if (render) {
            this.renderSubscribers.notify(this.current)
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
            this.velocityUpdateSubscribers.notify(this.getVelocity())
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
        }).then(() => this.clearAnimation())
    }

    /**
     * Stop the currently active animation.
     *
     * @public
     */
    stop() {
        if (this.stopAnimation) this.stopAnimation()
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
        this.updateSubscribers.clear()
        this.renderSubscribers.clear()
        this.stop()
    }
}

/**
 * @internal
 */
export function motionValue<V>(init: V) {
    return new MotionValue<V>(init)
}
