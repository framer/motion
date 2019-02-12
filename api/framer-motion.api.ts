// @public
declare const motion: MotionComponents;

// @internal (undocumented)
declare const MotionPluginContext: React.Context<Partial<MotionPlugins>>;

// @internal
declare function MotionPlugins({ children, ...props }: MotionPluginProps): JSX.Element;

// @internal (undocumented)
interface MotionPlugins {
    // (undocumented)
    transformPagePoint: (point: Point) => Point;
}

// @internal (undocumented)
declare class MotionValue<V = any> {
    // (undocumented)
    constructor(init: V, { transformer, parent }?: Config<V>);
    // (undocumented)
    addChild(config: Config<V>): MotionValue<V>;
    // (undocumented)
    addRenderSubscription(subscription: Subscriber<V>): () => boolean;
    // (undocumented)
    addUpdateSubscription(subscription: Subscriber<V>): () => boolean;
    // (undocumented)
    control(controller: ActionFactory, config: PopmotionTransitionProps, transformer?: Transformer<V>): Promise<{}>;
    // (undocumented)
    destroy(): void;
    // (undocumented)
    get(): V;
    // (undocumented)
    getVelocity(): number;
    // (undocumented)
    notifySubscriber: (subscriber: Subscriber<V>) => void;
    // (undocumented)
    removeChild(child: MotionValue): void;
    // (undocumented)
    scheduleVelocityCheck: () => import("framesync/lib/types").Process;
    // (undocumented)
    set(v: V, render?: boolean): void;
    // (undocumented)
    setChild: (child: MotionValue<any>) => void;
    // (undocumented)
    stop(): void;
    // (undocumented)
    subscribeTo(subscriptions: Set<Subscriber<V>>, subscription: Subscriber<V>): () => boolean;
    // (undocumented)
    velocityCheck: ({ timestamp }: FrameData) => void;
}

// @internal
declare function unwrapMotionValue<V>(value: V | MotionValue<V>): V;

// @public
declare function useAnimation(variants?: Variants, defaultTransition?: Transition): AnimationGroupControls;

// @public
declare function useCycle<T>(items: T[], initialIndex?: number): [T, (i?: any) => void];

// @public
declare function useGestures<P extends GestureHandlers>(props: P, ref: RefObject<Element>): void;

// @public
declare function useMotionValue<T>(init: T): MotionValue<T>;

// @internal (undocumented)
declare function usePanGesture(handlers: PanHandlers, ref: RefObject<Element>): undefined;

// @internal (undocumented)
declare function usePanGesture(handlers: PanHandlers): {
    // (undocumented)
    onPointerDown: EventHandler;
};

// @internal (undocumented)
declare function useTapGesture(handlers: TapHandlers & ControlsProp): {
    // (undocumented)
    onPointerDown: EventHandler;
};

// @internal (undocumented)
declare function useTapGesture(handlers: TapHandlers & ControlsProp, ref: RefObject<Element>): undefined;

// @public
declare function useTransformedValue(value: MotionValue, transform: Transformer_2): MotionValue;

// @public
declare function useTransformedValue(value: MotionValue<number>, from: number[], to: any[], options?: TransformerOptions): MotionValue;

// @public
declare function useViewportScrollValues(): ScrollMotionValues;


// (No @packageDocumentation comment for this package)
