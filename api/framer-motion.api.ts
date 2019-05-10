// @public
declare class AnimationControls {
    // @internal
    mount(): void;
    // @internal
    setDefaultTransition(transition: Transition): void;
    // @internal
    setVariants(variants: Variants): void;
    start(definition: AnimationDefinition, transitionOverride?: Transition): Promise<any>;
    stop(): void;
    // @internal
    subscribe(controls: ValueAnimationControls): () => boolean;
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
declare const createMotionComponent: <P extends {}>({ useFunctionalityComponents, }: MotionComponentConfig) => React.ForwardRefExoticComponent<React.PropsWithoutRef<P & MotionProps> & React.RefAttributes<Element>>;

// @public (undocumented)
interface CustomValueType {
    // (undocumented)
    mix: (from: any, to: any) => (p: number) => number | string;
    // (undocumented)
    toValue: () => number | string;
}

// @public (undocumented)
interface DraggableProps extends DragHandlers {
    drag?: boolean | "x" | "y";
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
    dragDirectionLock?: boolean;
    dragElastic?: boolean | number;
    dragMomentum?: boolean;
    dragPropagation?: boolean;
    dragTransition?: InertiaOptions;
}

// @public (undocumented)
interface DragHandlers {
    onDirectionLock?(axis: "x" | "y"): void;
    onDrag?(event: MouseEvent | TouchEvent, info: PanInfo): void;
    onDragEnd?(event: MouseEvent | TouchEvent, info: PanInfo): void;
    onDragStart?(event: MouseEvent | TouchEvent, info: PanInfo): void;
    onDragTransitionEnd?(): void;
}

// @public
declare type EasingFunction = (v: number) => number;

// @public (undocumented)
declare type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers;

// @public (undocumented)
interface HoverHandlers {
    onHoverEnd?(event: MouseEvent): void;
    onHoverStart?(event: MouseEvent): void;
    whileHover?: string | TargetAndTransition;
}

// @public (undocumented)
declare type HTMLMotionProps<TagName extends keyof ReactHTML> = HTMLAttributesWithoutMotionProps<UnwrapFactoryAttributes<ReactHTML[TagName]>, UnwrapFactoryElement<ReactHTML[TagName]>> & MotionProps;

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
    // @public
    ease?: Easing | Easing[];
    easings?: Easing | Easing[];
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
    to?: number | string | ValueTarget;
    // @public
    type: "keyframes";
    values: KeyframesTarget;
    // (undocumented)
    velocity?: number;
    // @public
    yoyo?: number;
}

// @public (undocumented)
declare type KeyframesTarget = ResolvedKeyframesTarget | [null, ...CustomValueType[]] | CustomValueType[];

// @public
declare const motion: {
    // (undocumented)
    symbol: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    circle: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    clipPath: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    defs: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    desc: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    ellipse: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feBlend: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feColorMatrix: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feComponentTransfer: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feComposite: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feConvolveMatrix: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feDiffuseLighting: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feDisplacementMap: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feDistantLight: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feFlood: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feFuncA: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feFuncB: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feFuncG: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feFuncR: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feGaussianBlur: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feImage: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feMerge: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feMergeNode: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feMorphology: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feOffset: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    fePointLight: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feSpecularLighting: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feSpotLight: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feTile: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feTurbulence: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    filter: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    foreignObject: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    g: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    image: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    line: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    linearGradient: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    marker: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    mask: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    path: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    metadata: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    pattern: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    polygon: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    polyline: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    radialGradient: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    rect: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    svg: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    stop: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    switch: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    tspan: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    text: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    textPath: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    use: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    view: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    animate: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    feDropShadow: ForwardRefExoticComponent<SVGMotionProps & RefAttributes<SVGElement>>;
    // (undocumented)
    object: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement> & MotionProps & RefAttributes<HTMLObjectElement>>;
    // (undocumented)
    big: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    link: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement> & MotionProps & RefAttributes<HTMLLinkElement>>;
    // (undocumented)
    small: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    sub: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    sup: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    track: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement> & MotionProps & RefAttributes<HTMLTrackElement>>;
    // (undocumented)
    progress: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement> & MotionProps & RefAttributes<HTMLProgressElement>>;
    // (undocumented)
    a: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & MotionProps & RefAttributes<HTMLAnchorElement>>;
    // (undocumented)
    abbr: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    address: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    area: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement> & MotionProps & RefAttributes<HTMLAreaElement>>;
    // (undocumented)
    article: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    aside: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    audio: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement> & MotionProps & RefAttributes<HTMLAudioElement>>;
    // (undocumented)
    b: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    base: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement> & MotionProps & RefAttributes<HTMLBaseElement>>;
    // (undocumented)
    bdo: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    blockquote: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").BlockquoteHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    body: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement> & MotionProps & RefAttributes<HTMLBodyElement>>;
    // (undocumented)
    br: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLBRElement>, HTMLBRElement> & MotionProps & RefAttributes<HTMLBRElement>>;
    // (undocumented)
    button: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & MotionProps & RefAttributes<HTMLButtonElement>>;
    // (undocumented)
    canvas: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> & MotionProps & RefAttributes<HTMLCanvasElement>>;
    // (undocumented)
    caption: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    cite: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    code: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    col: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement> & MotionProps & RefAttributes<HTMLTableColElement>>;
    // (undocumented)
    colgroup: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement> & MotionProps & RefAttributes<HTMLTableColElement>>;
    // (undocumented)
    data: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    datalist: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement> & MotionProps & RefAttributes<HTMLDataListElement>>;
    // (undocumented)
    dd: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    del: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").DelHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    details: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").DetailsHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    dfn: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    dialog: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement> & MotionProps & RefAttributes<HTMLDialogElement>>;
    // (undocumented)
    div: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & MotionProps & RefAttributes<HTMLDivElement>>;
    // (undocumented)
    dl: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement> & MotionProps & RefAttributes<HTMLDListElement>>;
    // (undocumented)
    dt: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    em: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    embed: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement> & MotionProps & RefAttributes<HTMLEmbedElement>>;
    // (undocumented)
    fieldset: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement> & MotionProps & RefAttributes<HTMLFieldSetElement>>;
    // (undocumented)
    figcaption: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    figure: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    footer: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    form: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & MotionProps & RefAttributes<HTMLFormElement>>;
    // (undocumented)
    h1: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    h2: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    h3: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    h4: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    h5: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    h6: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps & RefAttributes<HTMLHeadingElement>>;
    // (undocumented)
    head: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLHeadElement> & MotionProps & RefAttributes<HTMLHeadElement>>;
    // (undocumented)
    header: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    hgroup: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    hr: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement> & MotionProps & RefAttributes<HTMLHRElement>>;
    // (undocumented)
    html: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement> & MotionProps & RefAttributes<HTMLHtmlElement>>;
    // (undocumented)
    i: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    iframe: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> & MotionProps & RefAttributes<HTMLIFrameElement>>;
    // (undocumented)
    img: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & MotionProps & RefAttributes<HTMLImageElement>>;
    // (undocumented)
    input: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & MotionProps & RefAttributes<HTMLInputElement>>;
    // (undocumented)
    ins: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").InsHTMLAttributes<HTMLModElement>, HTMLModElement> & MotionProps & RefAttributes<HTMLModElement>>;
    // (undocumented)
    kbd: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    label: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> & MotionProps & RefAttributes<HTMLLabelElement>>;
    // (undocumented)
    legend: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement> & MotionProps & RefAttributes<HTMLLegendElement>>;
    // (undocumented)
    li: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & MotionProps & RefAttributes<HTMLLIElement>>;
    // (undocumented)
    map: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").MapHTMLAttributes<HTMLMapElement>, HTMLMapElement> & MotionProps & RefAttributes<HTMLMapElement>>;
    // (undocumented)
    mark: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    menu: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").MenuHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    meta: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement> & MotionProps & RefAttributes<HTMLMetaElement>>;
    // (undocumented)
    meter: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").MeterHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    nav: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    noscript: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    ol: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").OlHTMLAttributes<HTMLOListElement>, HTMLOListElement> & MotionProps & RefAttributes<HTMLOListElement>>;
    // (undocumented)
    optgroup: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement> & MotionProps & RefAttributes<HTMLOptGroupElement>>;
    // (undocumented)
    option: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement> & MotionProps & RefAttributes<HTMLOptionElement>>;
    // (undocumented)
    output: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").OutputHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    p: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & MotionProps & RefAttributes<HTMLParagraphElement>>;
    // (undocumented)
    param: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement> & MotionProps & RefAttributes<HTMLParamElement>>;
    // (undocumented)
    picture: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    pre: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & MotionProps & RefAttributes<HTMLPreElement>>;
    // (undocumented)
    q: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement> & MotionProps & RefAttributes<HTMLQuoteElement>>;
    // (undocumented)
    rt: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    ruby: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    s: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    samp: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    script: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement> & MotionProps & RefAttributes<HTMLScriptElement>>;
    // (undocumented)
    section: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    select: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & MotionProps & RefAttributes<HTMLSelectElement>>;
    // (undocumented)
    source: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement> & MotionProps & RefAttributes<HTMLSourceElement>>;
    // (undocumented)
    span: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & MotionProps & RefAttributes<HTMLSpanElement>>;
    // (undocumented)
    strong: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    style: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement> & MotionProps & RefAttributes<HTMLStyleElement>>;
    // (undocumented)
    table: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").TableHTMLAttributes<HTMLTableElement>, HTMLTableElement> & MotionProps & RefAttributes<HTMLTableElement>>;
    // (undocumented)
    tbody: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> & MotionProps & RefAttributes<HTMLTableSectionElement>>;
    // (undocumented)
    td: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement> & MotionProps & RefAttributes<HTMLTableDataCellElement>>;
    // (undocumented)
    textarea: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & MotionProps & RefAttributes<HTMLTextAreaElement>>;
    // (undocumented)
    tfoot: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> & MotionProps & RefAttributes<HTMLTableSectionElement>>;
    // (undocumented)
    th: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> & MotionProps & RefAttributes<HTMLTableHeaderCellElement>>;
    // (undocumented)
    thead: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> & MotionProps & RefAttributes<HTMLTableSectionElement>>;
    // (undocumented)
    time: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").TimeHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    title: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement> & MotionProps & RefAttributes<HTMLTitleElement>>;
    // (undocumented)
    tr: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> & MotionProps & RefAttributes<HTMLTableRowElement>>;
    // (undocumented)
    u: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    ul: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> & MotionProps & RefAttributes<HTMLUListElement>>;
    // (undocumented)
    var: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    video: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & MotionProps & RefAttributes<HTMLVideoElement>>;
    // (undocumented)
    wbr: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    menuitem: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    bdi: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    keygen: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").KeygenHTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    main: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    rp: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    summary: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps & RefAttributes<HTMLElement>>;
    // (undocumented)
    webview: ForwardRefExoticComponent<HTMLAttributesWithoutMotionProps<import("react").WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement> & MotionProps & RefAttributes<HTMLWebViewElement>>;
    // (undocumented)
    custom: (Component: ComponentType<any>) => ForwardRefExoticComponent<MotionProps & RefAttributes<Element>>;
};

// @public (undocumented)
interface MotionAdvancedProps {
    custom?: any;
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
    // @internal
    transformValues?<V extends any>(values: V): V;
}

// @public (undocumented)
declare type MotionStyle = MotionCSS & MotionTransform & MakeCustomValueType<CustomStyles>;

// @public (undocumented)
declare type MotionTransform = MakeMotion<TransformProperties>;

// @public
declare class MotionValue<V = any> {
    // @internal (undocumented)
    constructor(init: V, { transformer, parent }?: Config<V>);
    // @internal
    addChild(config: Config<V>): MotionValue<V>;
    destroy(): void;
    get(): V;
    getVelocity(): number;
    onChange(subscription: Subscriber<V>): () => boolean;
    // @internal
    onRenderRequest(subscription: Subscriber<V>): () => boolean;
    // @internal
    removeChild(child: MotionValue): void;
    set(v: V, render?: boolean): void;
    // @internal
    start(animation: StartAnimation): Promise<{}>;
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
    onPanSessionStart?(event: MouseEvent | TouchEvent, info: EventInfo): void;
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

// @public (undocumented)
declare type ResolvedKeyframesTarget = [null, ...number[]] | number[] | [null, ...string[]] | string[];

// @public (undocumented)
declare type ResolvedSingleTarget = string | number;

// @public (undocumented)
declare type ResolvedValueTarget = ResolvedSingleTarget | ResolvedKeyframesTarget;

// @internal
declare const safeWindow: Window | ServerSafeWindow;

// @public (undocumented)
declare type SingleTarget = ResolvedSingleTarget | CustomValueType;

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
    to?: number | string | ValueTarget;
    type: "spring";
    velocity?: number;
}

// @public (undocumented)
interface SVGMotionProps extends SVGAttributesWithoutMotionProps, MotionProps {
}

// @public (undocumented)
interface TapHandlers {
    onTap?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapCancel?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    onTapStart?(event: MouseEvent | TouchEvent, info: TapInfo): void;
    whileTap?: string | TargetAndTransition;
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
declare function transform<T>(inputValue: number, inputRange: number[], outputRange: T[], options?: TransformOptions<T>): T;

// @public
declare function transform<T>(inputRange: number[], outputRange: T[], options?: TransformOptions<T>): (inputValue: number) => T;

// @public
interface Tween {
    // @internal (undocumented)
    delay?: number;
    duration?: number;
    ease?: Easing | Easing[];
    easings?: Easing[];
    // @internal
    elapsed?: number;
    flip?: number;
    from?: number | string;
    loop?: number;
    times?: number[];
    // @internal (undocumented)
    to?: number | string | ValueTarget;
    type?: "tween";
    // @internal (undocumented)
    velocity?: number;
    yoyo?: number;
}

// @internal
declare function unwrapMotionValue(value?: string | number | CustomValueType | MotionValue): string | number;

// @beta
declare function useAnimatedState(initialState: any): any[];

// @public
declare function useAnimation(): AnimationControls;

// @public
declare function useCycle<T>(...items: T[]): CycleState<T>;

// @internal
declare function useExternalRef<E = Element>(external?: Ref<E | null>): RefObject<E | null>;

// @public
declare function useGestures<GestureHandlers>(props: GestureHandlers, ref: RefObject<Element>): void;

// @public
declare function useMotionValue<T>(initial: T): import(".").MotionValue<T>;

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
declare function useTransform(value: MotionValue, transform: Transformer_2): MotionValue;

// @public
declare function useTransform<T>(value: MotionValue<number>, from: number[], to: any[], options?: TransformOptions<T>): MotionValue;

// @public
declare function useViewportScroll(): ScrollMotionValues;

// @public (undocumented)
declare type ValueTarget = SingleTarget | KeyframesTarget;

// @public (undocumented)
declare type Variant = TargetAndTransition | TargetResolver;

// @public (undocumented)
declare type Variants = {
    // (undocumented)
    [key: string]: Variant;
};


// (No @packageDocumentation comment for this package)
