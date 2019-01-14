import sync, { getFrameData, FrameData, cancelSync } from "framesync"
import { chain, delay as delayAction, Action, ColdSubscription } from "popmotion"
import { velocityPerSecond } from "@popmotion/popcorn"
import { PopmotionTransitionDefinition } from "../types"

export type Transformer<T> = (v: T) => T

export type Subscriber<T> = (v: T) => void

export type Config<T> = {
    transformer?: Transformer<T>
    parent?: MotionValue<T>
}

export type ActionFactory = (actionConfig: PopmotionTransitionDefinition) => Action

const isFloat = (value: any): value is string => {
    return !isNaN(parseFloat(value))
}

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
    private updateSubscribers: Set<Subscriber<V>>

    // Render subscribers are updated on the render step
    private renderSubscribers: Set<Subscriber<V>>

    private cancelSubscriber: Set<() => void> = new Set()

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

    addUpdateSubscription(subscription: Subscriber<V>) {
        if (!this.updateSubscribers) this.updateSubscribers = new Set()

        const updateSubscriber = () => subscription(this.current)
        const scheduleUpdate = () => sync.update(updateSubscriber, false, true)
        this.updateSubscribers.add(scheduleUpdate)

        this.cancelSubscriber.add(() => cancelSync.update(updateSubscriber))

        return () => this.updateSubscribers.delete(scheduleUpdate)
    }

    addRenderSubscription(subscription: Subscriber<V>) {
        if (!this.renderSubscribers) this.renderSubscribers = new Set()

        const updateSubscriber = () => subscription(this.current)
        const scheduleUpdate = () => sync.render(updateSubscriber)
        this.renderSubscribers.add(scheduleUpdate)

        scheduleUpdate()

        this.cancelSubscriber.add(() => cancelSync.render(updateSubscriber))

        return () => this.renderSubscribers.delete(scheduleUpdate)
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
        this.timeDelta = delta
        this.lastUpdated = timestamp
        sync.postRender(this.scheduleVelocityCheck)
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
              velocityPerSecond(parseFloat(this.prev as any) - parseFloat(this.current as any), this.timeDelta)
            : 0
    }

    control(
        controller: ActionFactory,
        { delay, ...config }: PopmotionTransitionDefinition,
        transformer?: Transformer<V>
    ) {
        this.stop()

        let initialisedController = controller({
            from: this.get() as any,
            velocity: this.getVelocity(),
            ...config,
        })

        if (transformer) {
            initialisedController = initialisedController.pipe(transformer)
        }

        if (delay) {
            initialisedController = chain(delayAction(delay), initialisedController)
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
        this.updateSubscribers.clear()
        this.renderSubscribers.clear()
        this.cancelSubscriber.forEach(cancel => cancel())
        this.cancelSubscriber.clear()
        this.parent && this.parent.removeChild(this)
        this.stop()
    }
}

export const motionValue = <V>(init: V, opts?: Config<V>) => new MotionValue<V>(init, opts)
