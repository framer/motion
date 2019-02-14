import sync, { getFrameData, FrameData } from "framesync"
import {
    chain,
    delay as delayAction,
    Action,
    ColdSubscription,
} from "popmotion"
import { velocityPerSecond } from "@popmotion/popcorn"
import { PopmotionTransitionProps } from "../types"

export type Transformer<T> = (v: T) => T

export type Subscriber<T> = (v: T) => void

export type Config<T> = {
    transformer?: Transformer<T>
    parent?: MotionValue<T>
}

export type ActionFactory = (actionConfig: PopmotionTransitionProps) => Action

const isFloat = (value: any): value is string => {
    return !isNaN(parseFloat(value))
}

// This function is unrolled and mutative, as the number of props
// is too small to really warrent a loop and by this point config
// has been recreated many times over.
const parseDurations = (config: PopmotionTransitionProps) => {
    if (config["duration"]) {
        config["duration"] = config["duration"] * 1000
    }

    if (config.delay) {
        config.delay = config.delay * 1000
    }

    return config
}
/**
 * @internal
 */
export class MotionValue<V = any> {
    // Current state
    private current: V

    // Previous state
    private prev: V

    private timeDelta: number = 0
    private lastUpdated: number = 0

    // Children get updated onUpdate
    private children?: Set<MotionValue>

    // A reference to the value's parent - currently used for unregistering as a child,
    // but maybe it'd be better for this to be just a disconnect function
    private parent?: MotionValue

    // Update subscribers are updated on the update step
    private updateSubscribers?: Set<Subscriber<V>>

    // Render subscribers are updated on the render step
    private renderSubscribers?: Set<Subscriber<V>>

    // If set, will pass `set` values through this function first
    private transformer?: Transformer<V>

    // A reference to the currently-controlling animation
    private controller?: ColdSubscription

    private canTrackVelocity = false

    constructor(init: V, { transformer, parent }: Config<V> = {}) {
        this.parent = parent
        this.transformer = transformer
        this.set(init)
        this.canTrackVelocity = isFloat(this.current)
    }

    addChild(config: Config<V>) {
        const child = new MotionValue(this.current, {
            parent: this,
            ...config,
        })

        if (!this.children) this.children = new Set()

        this.children.add(child)

        return child
    }

    removeChild(child: MotionValue) {
        if (!this.children) {
            return
        }
        this.children.delete(child)
    }

    subscribeTo(
        subscriptions: Set<Subscriber<V>>,
        subscription: Subscriber<V>
    ) {
        const updateSubscriber = () => subscription(this.current)
        subscriptions.add(updateSubscriber)
        return () => subscriptions.delete(updateSubscriber)
    }

    addUpdateSubscription(subscription: Subscriber<V>) {
        if (!this.updateSubscribers) this.updateSubscribers = new Set()
        return this.subscribeTo(this.updateSubscribers, subscription)
    }

    addRenderSubscription(subscription: Subscriber<V>) {
        if (!this.renderSubscribers) this.renderSubscribers = new Set()
        // Render immediately
        this.notifySubscriber(subscription)
        return this.subscribeTo(this.renderSubscribers, subscription)
    }

    set(v: V, render = true) {
        this.prev = this.current
        this.current = this.transformer ? this.transformer(v) : v

        if (this.updateSubscribers) {
            this.updateSubscribers.forEach(this.notifySubscriber)
        }

        if (this.children) {
            this.children.forEach(this.setChild)
        }

        if (render && this.renderSubscribers) {
            this.renderSubscribers.forEach(this.notifySubscriber)
        }

        // Update timestamp
        const { delta, timestamp } = getFrameData()

        if (this.lastUpdated !== timestamp) {
            this.timeDelta = delta
            this.lastUpdated = timestamp
            sync.postRender(this.scheduleVelocityCheck)
        }
    }

    notifySubscriber = (subscriber: Subscriber<V>) => {
        subscriber(this.current)
    }

    scheduleVelocityCheck = () => sync.postRender(this.velocityCheck)

    velocityCheck = ({ timestamp }: FrameData) => {
        if (timestamp !== this.lastUpdated) {
            this.prev = this.current
        }
    }

    setChild = (child: MotionValue) => child.set(this.current)

    get() {
        return this.current
    }

    getVelocity() {
        // This could be isFloat(this.prev) && isFloat(this.current), but that would be wastefull
        return this.canTrackVelocity
            ? // These casts could be avoided if parseFloat would be typed better
              velocityPerSecond(
                  parseFloat(this.current as any) -
                      parseFloat(this.prev as any),
                  this.timeDelta
              )
            : 0
    }

    control(
        controller: ActionFactory,
        config: PopmotionTransitionProps,
        transformer?: Transformer<V>
    ) {
        this.stop()

        const { delay, ...timeAdjustedConfig } = parseDurations(config)

        let initialisedController = controller({
            from: this.get() as any,
            velocity: this.getVelocity(),
            ...timeAdjustedConfig,
        })

        if (transformer) {
            initialisedController = initialisedController.pipe(transformer)
        }

        if (delay) {
            initialisedController = chain(
                delayAction(delay),
                initialisedController
            )
        }

        return new Promise(complete => {
            this.controller = initialisedController.start({
                update: (v: V) => this.set(v),
                complete,
            })
        })
    }

    stop() {
        if (this.controller) this.controller.stop()
    }

    destroy() {
        this.updateSubscribers && this.updateSubscribers.clear()
        this.renderSubscribers && this.renderSubscribers.clear()
        this.parent && this.parent.removeChild(this)
        this.stop()
    }
}

export function motionValue<V>(init: V, opts?: Config<V>) {
    return new MotionValue<V>(init, opts)
}
