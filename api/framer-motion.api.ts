// @public (undocumented)
interface AnimationProps {
    animate?: AnimationGroupControls | TargetAndTransition | VariantLabels;
    transition?: Transition;
    variants?: Variants;
}

// @public (undocumented)
interface DraggableProps {
    dragConstraints?: Constraints;
    dragElastic?: Overdrag;
    dragEnabled?: boolean | "x" | "y" | "lockDirection";
    dragMomentum?: boolean;
    dragPropagation?: boolean;
    onDirectionLock?(axis: "x" | "y"): void;
    onDragEnd?(e: MouseEvent | TouchEvent): void;
    onDragStart?(e: MouseEvent | TouchEvent): void;
}

// @public (undocumented)
declare type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers;

// @public (undocumented)
interface HoverHandlers {
    hover?: string | TargetAndTransition;
    onHoverEnd?(event: MouseEvent): void;
    onHoverStart?(event: MouseEvent): void;
}

// @public
declare const motion: MotionComponents;

// @public (undocumented)
interface MotionAdvancedProps {
    inherit?: boolean;
    render?: boolean;
}

// @public (undocumented)
interface MotionCallbacks {
    onAnimationComplete?(): void;
    onUpdate?(latest: {
        // (undocumented)
        [key: string]: string | number;
    }): void;
}

// @internal (undocumented)
declare const MotionPluginContext: React.Context<Partial<MotionPlugins>>;

// @internal
declare function MotionPlugins({ children, ...props }: MotionPluginProps): JSX.Element;

// @internal (undocumented)
interface MotionPlugins {
    // (undocumented)
    transformPagePoint: (point: Point) => Point;
}

// @public
interface MotionProps extends AnimationProps, MotionCallbacks, GestureHandlers, DraggableProps, MotionAdvancedProps {
    // @internal (undocumented)
    [key: string]: any;
    initial?: Target | VariantLabels;
    style?: MotionStyle;
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

// @public (undocumented)
interface PanHandlers {
    onPan?: PanHandler;
    onPanEnd?: PanHandler;
    onPanStart?: PanHandler;
}

// @public (undocumented)
interface TapHandlers {
    onTap?: TapHandler;
    onTapCancel?: TapHandler;
    onTapStart?: TapHandler;
    tap?: string | TargetAndTransition;
}

// @internal
declare function unwrapMotionValue<V>(value: V | MotionValue<V>): V;

// @public
declare function useAnimation(variants?: Variants, defaultTransition?: Transition): AnimationGroupControls;

// @public
declare function useCycle<T>(items: T[], initialIndex?: number): CycleState<T>;

// @internal
declare const useExternalRef: (external?: RefObject<Element | null> | ((instance: Element | null) => void) | null | undefined) => RefObject<Element | null>;

// @public
declare function useGestures<GestureHandlers>(props: GestureHandlers, ref: RefObject<Element>): void;

// @public
declare function useMotionValue<T>(initial: T): MotionValue<T>;

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
declare function useTransformedValue(value: MotionValue<number>, from: number[], to: any[], options?: MapOptions): MotionValue;

// @public
declare function useViewportScrollValues(): ScrollMotionValues;


// (No @packageDocumentation comment for this package)
