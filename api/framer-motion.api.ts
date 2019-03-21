// @public
declare class AnimationControls {
    // @internal
    mount(): void;
    // @internal
    setDefaultTransition(transition: Transition): void;
    // @internal
    setVariants(variants: Variants): void;
    start(definition: Variant | string, transitionOverride?: Transition): Promise<any>;
    stop(): void;
    // @internal
    subscribe(controls: ComponentAnimationControls): () => boolean;
    // @internal
    unmount(): void;
    }

// @internal (undocumented)
declare const animationControls: () => AnimationControls;

// @public (undocumented)
interface AnimationProps {
    animate?: AnimationControls | TargetAndTransition | VariantLabels;
    transition?: Transition;
    variants?: Variants;
}

// @internal (undocumented)
declare const createMotionComponent: <P extends {}>(Component: string | React.ComponentClass<P, any> | React.FunctionComponent<P>) => React.ForwardRefExoticComponent<React.PropsWithoutRef<P & MotionProps> & React.RefAttributes<Element>>;

// @public
declare type CustomMotionComponent = {
    // (undocumented)
    custom: typeof createMotionComponent;
};

// @public (undocumented)
interface DraggableProps extends DragHandlers {
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
    dragTransition?: InertiaOptions;
}

// @public (undocumented)
interface DragHandlers {
    onDirectionLock?(axis: "x" | "y"): void;
    onDrag?(e: MouseEvent | TouchEvent, info: PanInfo): void;
    onDragEnd?(e: MouseEvent | TouchEvent, info: PanInfo): void;
    onDragStart?(e: MouseEvent | TouchEvent, info: PanInfo): void;
}

// @public
declare type EasingFunction = (v: number) => number;

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

// @public
declare type HTMLMotionComponents = {
    [K in HTMLElements]: RefForwardingComponent<UnwrapFactory<ReactHTML[K]>, HTMLMotionProps<K>>;
};

// @public
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

// @internal
interface Keyframes {
    // (undocumented)
    delay?: number;
    // @public
    duration?: number;
    // (undocumented)
    ease?: Easing;
    // @public
    easings?: Easing[];
    // (undocumented)
    elapsed?: number;
    // @public
    flip?: number;
    // (undocumented)
    from?: number | string;
    // @public
    loop?: number;
    // @public
    times?: number[];
    // (undocumented)
    to?: number | string;
    // @public
    type: "keyframes";
    values: KeyframesTarget;
    // (undocumented)
    velocity?: number;
    // @public
    yoyo?: number;
}

// @public
declare const motion: MotionComponents;

// @public (undocumented)
interface MotionAdvancedProps {
    // @internal
    inherit?: boolean;
    // @internal
    static?: boolean;
}

// @public (undocumented)
interface MotionCallbacks {
    onAnimationComplete?(): void;
    onUpdate?(latest: {
        // (undocumented)
        [key: string]: string | number;
    }): void;
}

// @public
declare type MotionComponents = CustomMotionComponent & HTMLMotionComponents & SVGMotionComponents;

// @internal (undocumented)
declare const MotionContext: import("react").Context<MotionContextProps>;

// @internal (undocumented)
declare const MotionPluginContext: React.Context<Partial<MotionPlugins>>;

// @internal
declare function MotionPlugins({ children, ...props }: MotionPluginProps): JSX.Element;

// @internal (undocumented)
interface MotionPlugins {
    // (undocumented)
    transformPagePoint?: (point: Point) => Point;
}

// @public
interface MotionProps extends AnimationProps, MotionCallbacks, GestureHandlers, DraggableProps, MotionAdvancedProps {
    initial?: Target | VariantLabels;
    style?: MotionStyle;
    transformTemplate?(transform: TransformProperties, generatedTransform: string): string;
}

// @public (undocumented)
declare type MotionStyle = MotionCSS & MotionTransform & MakeCustomValueType<CustomStyles>;

// @public
declare class MotionValue<V = any> {
    // @internal (undocumented)
    constructor(init: V, { transformer, parent }?: Config<V>);
    // @internal
    addChild(config: Config<V>): MotionValue<V>;
    addRenderSubscription(subscription: Subscriber<V>): () => boolean;
    addUpdateSubscription(subscription: Subscriber<V>): () => boolean;
    // @internal
    control(controller: ActionFactory, config: PopmotionTransitionProps, transformer?: Transformer<V>): Promise<{}>;
    destroy(): void;
    get(): V;
    getVelocity(): number;
    // @internal
    removeChild(child: MotionValue): void;
    set(v: V, render?: boolean): void;
    stop(): void;
    }

// @internal (undocumented)
declare function motionValue<V>(init: V, opts?: Config<V>): MotionValue<V>;

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

// @public
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

// @public
interface PanInfo {
    delta: Point;
    offset: Point;
    point: Point;
    velocity: Point;
}

// @public
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
interface Point {
    // (undocumented)
    x: number;
    // (undocumented)
    y: number;
}

// @public (undocumented)
declare namespace Point {
    const // @beta (undocumented)
 subtract: (a: Point, b: Point) => Point;
    const // @beta (undocumented)
 relativeTo: (idOrElem: string | HTMLElement) => ({ x, y }: Point) => Point | undefined;
}

// @internal
declare const safeWindow: Window | ServerSafeWindow;

// @public
interface Spring {
    damping?: number;
    // @internal (undocumented)
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

// @public
declare type SVGMotionComponents = {
    [K in SVGElements]: RefForwardingComponent<SVGElement, SVGMotionProps>;
};

// @public (undocumented)
interface TapHandlers {
    onTap?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapCancel?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapStart?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    press?: string | TargetAndTransition;
}

// @public
interface TapInfo {
    point: Point;
}

// @public
declare type TargetAndTransition = TargetWithKeyframes & {
    // (undocumented)
    transition?: Transition;
    // (undocumented)
    transitionEnd?: Target;
};

// @public
declare function transform<T>(inputRange: number[], outputRange: T[], options?: TransformOptions<T>): (v: number) => any;

// @public
interface Tween {
    // @internal (undocumented)
    delay?: number;
    duration?: number;
    ease?: Easing;
    easings?: Easing[];
    // @internal
    elapsed?: number;
    flip?: number;
    from?: number | string;
    loop?: number;
    times?: number[];
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
declare function useTransformedValue<T>(value: MotionValue<number>, from: number[], to: any[], options?: TransformOptions<T>): MotionValue;

// @public
declare function useViewportScrollValues(): ScrollMotionValues;


// (No @packageDocumentation comment for this package)
