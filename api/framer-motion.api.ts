// @public (undocumented)
interface AnimationProps {
    animate?: AnimationControls | TargetAndTransition | VariantLabels;
    transition?: Transition;
    variants?: Variants;
}

// @internal (undocumented)
declare const createMotionComponent: <P extends {}>(Component: string | React.ComponentClass<P, any> | React.FunctionComponent<P>) => React.ForwardRefExoticComponent<Pick<P & MotionProps, string | number | Exclude<keyof P, "ref">> & React.RefAttributes<Element>>;

// @public (undocumented)
interface DraggableProps {
    dragConstraints?: false | {
        // (undocumented)
        top?: number;
        // (undocumented)
        right?: number;
        // (undocumented)
        bottom?: number;
        // (undocumented)
        left?: number;
    };
    dragElastic?: boolean | number;
    dragEnabled?: boolean | "x" | "y" | "lockDirection";
    dragMomentum?: boolean;
    dragPropagation?: boolean;
    onDirectionLock?(axis: "x" | "y"): void;
    onDrag?(e: MouseEvent | TouchEvent, info: PanInfo): void;
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

// @internal (undocumented)
declare const htmlElements: ("object" | "track" | "progress" | "a" | "abbr" | "address" | "area" | "article" | "aside" | "audio" | "b" | "base" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "map" | "mark" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "small" | "source" | "span" | "strong" | "style" | "sub" | "sup" | "table" | "tbody" | "td" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr" | "menuitem" | "bdi" | "big" | "keygen" | "main" | "rp" | "summary" | "webview")[];

// @public (undocumented)
interface Inertia {
    bounceDamping?: number;
    bounceStiffness?: number;
    // @internal (undocumented)
    delay?: number;
    from?: number | string;
    max?: number;
    min?: number;
    modifyTarget?(v: number): number;
    power?: number;
    restDelta?: number;
    timeConstant?: number;
    type: "inertia";
    velocity?: number;
}

// @public (undocumented)
interface Keyframes {
    // @internal (undocumented)
    delay?: number;
    duration?: number;
    easings?: Easing[];
    // @internal (undocumented)
    elapsed?: number;
    flip?: number;
    // @internal (undocumented)
    from?: number | string;
    loop?: number;
    times: number[];
    // @internal (undocumented)
    to?: number | string;
    type: "keyframes";
    values: number[] | string[];
    // @internal (undocumented)
    velocity?: number;
    yoyo?: number;
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
interface None {
    // @internal (undocumented)
    delay?: number;
    // @internal (undocumented)
    from?: number | string;
    type: false;
    // @internal (undocumented)
    velocity?: number;
}

// @public (undocumented)
interface Orchestration {
    delay?: number;
    delayChildren?: number;
    staggerChildren?: number;
    staggerDirection?: 1 | -1;
    when?: false | "beforeChildren" | "afterChildren";
}

// @public (undocumented)
interface PanHandlers {
    onPan?(event: MouseEvent | TouchEvent, info: PanInfo): void;
    onPanEnd?(event: MouseEvent | TouchEvent, info: PanInfo): void;
    onPanStart?(event: MouseEvent | TouchEvent, info: PanInfo): void;
}

// @public (undocumented)
interface Physics {
    acceleration?: number;
    // @internal (undocumented)
    delay?: number;
    friction?: number;
    from?: number | string;
    restSpeed?: number;
    type: "physics";
    velocity?: number;
}

// @public (undocumented)
interface Spring {
    damping?: number;
    // (undocumented)
    delay?: number;
    from?: number | string;
    mass?: number;
    restDelta?: number;
    restSpeed?: number;
    stiffness?: number;
    // @internal (undocumented)
    to?: number | string;
    type: "spring";
    velocity?: number;
}

// @internal (undocumented)
declare const svgElements: (keyof ReactSVG)[];

// @public (undocumented)
interface TapHandlers {
    onTap?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapCancel?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapStart?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    tap?: string | TargetAndTransition;
}

// @public
interface Tween {
    // @internal (undocumented)
    delay?: number;
    duration?: number;
    ease?: [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate" | EasingFunction;
    // @internal
    elapsed?: number;
    flip?: number;
    from?: number | string;
    loop?: number;
    // @internal (undocumented)
    to?: number | string;
    type?: "tween";
    // @internal (undocumented)
    velocity?: number;
    yoyo?: number;
}

// @internal
declare function unwrapMotionValue<V>(value: V | MotionValue<V>): V;

// @public
declare function useAnimation(variants?: Variants, defaultTransition?: Transition): AnimationControls;

// @public
declare function useCycle<T>(items: T[], initialIndex?: number): CycleState<T>;

// @internal
declare function useExternalRef<E = Element>(external?: Ref<E | null>): RefObject<E | null>;

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
