import sync, { getFrameData, FrameData } from 'framesync';
import { Action, ColdSubscription } from 'popmotion';
import { velocityPerSecond } from '@popmotion/popcorn';

export type ValuePrimitive = any;

export type Transformer = (v: ValuePrimitive) => ValuePrimitive;

export type Subscriber = (v: ValuePrimitive) => void;

export type Config = {
  transformer?: Transformer;
  onRender?: Subscriber;
  parent?: MotionValue;
};

export type ActionConfig = { [key: string]: any };

export type ActionFactory = (actionConfig: ActionConfig) => Action;

export class MotionValue {
  // Current state
  private current: ValuePrimitive;

  // Previous state
  private prev: ValuePrimitive;

  private timeDelta: number = 0;
  private lastUpdated: number = 0;

  // Children get updated onUpdate
  private children: Set<MotionValue>;

  // A reference to the value's parent - currently used for unregistering as a child,
  // but maybe it'd be better for this to be just a disconnect function
  private parent?: MotionValue;

  // onRender is fired on render step after update
  private onRender: Subscriber | null;

  // Fired
  private subscribers: Set<Subscriber>;

  // If set, will pass `set` values through this function first
  private transformer?: Transformer;

  // A reference to the currently-controlling animation
  private controller?: ColdSubscription;

  private canTrackVelocity = false;

  constructor(
    init: ValuePrimitive,
    { onRender, transformer, parent }: Config = {}
  ) {
    this.parent = parent;
    this.transformer = transformer;
    if (onRender) this.setOnRender(onRender);
    this.set(init);
    this.canTrackVelocity = !isNaN(parseFloat(this.current));
  }

  addChild(config: Config) {
    const child = new MotionValue(this.current, {
      parent: this,
      ...config
    });

    if (!this.children) this.children = new Set();

    this.children.add(child);

    return child;
  }

  removeChild(child: MotionValue) {
    this.children.delete(child);
  }

  setOnRender(onRender: Subscriber | null) {
    this.onRender = onRender;
    if (this.onRender) sync.render(this.render);
  }

  addSubscriber(sub: Subscriber) {
    if (!this.subscribers) this.subscribers = new Set();
    this.subscribers.add(sub);
  }

  removeSubscriber(sub: Subscriber) {
    if (this.subscribers) {
      this.subscribers.delete(sub);
    }
  }

  set(v: ValuePrimitive) {
    this.prev = this.current;
    this.current = this.transformer ? this.transformer(v) : v;

    if (this.subscribers) {
      sync.update(this.notifySubscribers, false, true);
    }

    if (this.children) {
      this.children.forEach(this.setChild);
    }

    if (this.onRender) {
      sync.render(this.render);
    }

    // Update timestamp
    const { delta, timestamp } = getFrameData();
    this.timeDelta = delta;
    this.lastUpdated = timestamp;
    sync.postRender(this.scheduleVelocityCheck);
  }

  scheduleVelocityCheck = () => sync.postRender(this.velocityCheck);

  velocityCheck = ({ timestamp }: FrameData) => {
    if (timestamp !== this.lastUpdated) {
      this.prev = this.current;
    }
  };

  notifySubscribers = () => this.subscribers.forEach(this.setSubscriber);
  setSubscriber = (sub: Subscriber) => sub(this.current);
  setChild = (child: MotionValue) => child.set(this.current);

  get() {
    return this.current;
  }

  getVelocity() {
    return this.canTrackVelocity
      ? velocityPerSecond(
          parseFloat(this.prev) - parseFloat(this.current),
          this.timeDelta
        )
      : 0;
  }

  render = () => {
    if (this.onRender) this.onRender(this.current);
  };

  control(
    controller: ActionFactory,
    config: ActionConfig,
    transformer?: Transformer
  ) {
    this.stop();

    let initialisedController = controller({
      from: this.get(),
      velocity: this.getVelocity(),
      ...config
    });

    if (transformer) {
      initialisedController = initialisedController.pipe(transformer);
    }

    return new Promise(complete => {
      this.controller = initialisedController.start({
        update: (v: ValuePrimitive) => this.set(v),
        complete
      });
    });
  }

  stop() {
    if (this.controller) this.controller.stop();
  }

  destroy() {
    this.setOnRender(null);
    this.parent && this.parent.removeChild(this);
    this.stop();
  }

  hasOnRender() {
    return !!this.onRender;
  }
}

export default (init: ValuePrimitive, opts?: Config) =>
  new MotionValue(init, opts);
