import sync, { getFrameData, FrameData } from "framesync"
import { chain, delay as delayAction, Action, ColdSubscription } from "popmotion"
import { velocityPerSecond } from "@popmotion/popcorn"

export type Transformer<T> = (v: T) => T

export type Subscriber<T> = (v: T) => void

export type Config<T> = {
    transformer?: Transformer<T>
    onRender?: Subscriber<T>
    parent?: MotionValue<T>
}

export type ActionConfig = { [key: string]: any }

export type ActionFactory = (actionConfig: ActionConfig) => Action

const isFloat = (value: any): value is string => {
    return !isNaN(parseFloat(value))
}

export class MotionValue<ValuePrimitive = any> {
    // Current state
    private current: ValuePrimitive

    // Previous state
    private prev: ValuePrimitive

    private timeDelta: number = 0
    private lastUpdated: number = 0

    // Children get updated onUpdate
    private children: Set<MotionValue>

    // A reference to the value's parent - currently used for unregistering as a child,
    // but maybe it'd be better for this to be just a disconnect function
    private parent?: MotionValue

    // onRender is fired on render step after update
    private onRender: Subscriber<ValuePrimitive> | null

    // Fired
    private subscribers: Set<Subscriber<ValuePrimitive>>

    // If set, will pass `set` values through this function first
    private transformer?: Transformer<ValuePrimitive>

    // A reference to the currently-controlling animation
    private controller?: ColdSubscription

    private canTrackVelocity = false

    constructor(init: ValuePrimitive, { onRender, transformer, parent }: Config<ValuePrimitive> = {}) {
        this.parent = parent
        this.transformer = transformer
        if (onRender) this.setOnRender(onRender)
        this.set(init)
        this.canTrackVelocity = isFloat(this.current)
    }

    addChild(config: Config<ValuePrimitive>) {
        const child = new MotionValue(this.current, {
            parent: this,
            ...config,
        })

        if (!this.children) this.children = new Set()

        this.children.add(child)

        return child
    }

    removeChild(child: MotionValue) {
        this.children.delete(child)
    }

    setOnRender(onRender: Subscriber<ValuePrimitive> | null) {
        this.onRender = onRender
        if (this.onRender) sync.render(this.render)
    }

    addSubscriber(sub: Subscriber<ValuePrimitive>) {
        if (!this.subscribers) this.subscribers = new Set()
        this.subscribers.add(sub)
    }

    removeSubscriber(sub: Subscriber<ValuePrimitive>) {
        if (this.subscribers) {
            this.subscribers.delete(sub)
        }
    }

    set(v: ValuePrimitive, render = true) {
        this.prev = this.current
        this.current = this.transformer ? this.transformer(v) : v

        if (this.subscribers) {
            sync.update(this.notifySubscribers, false, true)
        }

        if (this.children) {
            this.children.forEach(this.setChild)
        }

        if (render && this.onRender) {
            this.onRender(this.current)
        }

        // Update timestamp
        const { delta, timestamp } = getFrameData()
        this.timeDelta = delta
        this.lastUpdated = timestamp
        sync.postRender(this.scheduleVelocityCheck)
    }

    scheduleVelocityCheck = () => sync.postRender(this.velocityCheck)

    velocityCheck = ({ timestamp }: FrameData) => {
        if (timestamp !== this.lastUpdated) {
            this.prev = this.current
        }
    }

    notifySubscribers = () => this.subscribers.forEach(this.setSubscriber)
    setSubscriber = (sub: Subscriber<ValuePrimitive>) => sub(this.current)
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

    render = () => {
        if (this.onRender) this.onRender(this.current)
    }

    control(controller: ActionFactory, { delay, ...config }: ActionConfig, transformer?: Transformer<ValuePrimitive>) {
        this.stop()

        let initialisedController = controller({
            from: this.get(),
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
                update: (v: ValuePrimitive) => this.set(v),
                complete,
            })
        })
    }

    stop() {
        if (this.controller) this.controller.stop()
    }

    destroy() {
        this.setOnRender(null)
        this.parent && this.parent.removeChild(this)
        this.stop()
    }

    hasOnRender() {
        return !!this.onRender
    }
}

export const motionValue = <V>(init: V, opts?: Config<V>) => new MotionValue<V>(init, opts)
