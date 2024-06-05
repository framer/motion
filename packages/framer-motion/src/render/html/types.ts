import { ResolvedValues } from "../types"
import { HTMLAttributes, PropsWithoutRef, RefAttributes, type JSX } from "react"
import { MotionProps } from "../../motion/types"

interface HTMLElements {
    a: HTMLAnchorElement
    abbr: HTMLElement
    address: HTMLElement
    area: HTMLAreaElement
    article: HTMLElement
    aside: HTMLElement
    audio: HTMLAudioElement
    b: HTMLElement
    base: HTMLBaseElement
    bdi: HTMLElement
    bdo: HTMLElement
    big: HTMLElement
    blockquote: HTMLQuoteElement
    body: HTMLBodyElement
    br: HTMLBRElement
    button: HTMLButtonElement
    canvas: HTMLCanvasElement
    caption: HTMLElement
    center: HTMLElement
    cite: HTMLElement
    code: HTMLElement
    col: HTMLTableColElement
    colgroup: HTMLTableColElement
    data: HTMLDataElement
    datalist: HTMLDataListElement
    dd: HTMLElement
    del: HTMLModElement
    details: HTMLDetailsElement
    dfn: HTMLElement
    dialog: HTMLDialogElement
    div: HTMLDivElement
    dl: HTMLDListElement
    dt: HTMLElement
    em: HTMLElement
    embed: HTMLEmbedElement
    fieldset: HTMLFieldSetElement
    figcaption: HTMLElement
    figure: HTMLElement
    footer: HTMLElement
    form: HTMLFormElement
    h1: HTMLHeadingElement
    h2: HTMLHeadingElement
    h3: HTMLHeadingElement
    h4: HTMLHeadingElement
    h5: HTMLHeadingElement
    h6: HTMLHeadingElement
    head: HTMLHeadElement
    header: HTMLElement
    hgroup: HTMLElement
    hr: HTMLHRElement
    html: HTMLHtmlElement
    i: HTMLElement
    iframe: HTMLIFrameElement
    img: HTMLImageElement
    input: HTMLInputElement
    ins: HTMLModElement
    kbd: HTMLElement
    keygen: HTMLElement
    label: HTMLLabelElement
    legend: HTMLLegendElement
    li: HTMLLIElement
    link: HTMLLinkElement
    main: HTMLElement
    map: HTMLMapElement
    mark: HTMLElement
    menu: HTMLElement
    menuitem: HTMLElement
    meta: HTMLMetaElement
    meter: HTMLMeterElement
    nav: HTMLElement
    noindex: HTMLElement
    noscript: HTMLElement
    object: HTMLObjectElement
    ol: HTMLOListElement
    optgroup: HTMLOptGroupElement
    option: HTMLOptionElement
    output: HTMLOutputElement
    p: HTMLParagraphElement
    param: HTMLParamElement
    picture: HTMLElement
    pre: HTMLPreElement
    progress: HTMLProgressElement
    q: HTMLQuoteElement
    rp: HTMLElement
    rt: HTMLElement
    ruby: HTMLElement
    s: HTMLElement
    samp: HTMLElement
    search: HTMLElement
    slot: HTMLSlotElement
    script: HTMLScriptElement
    section: HTMLElement
    select: HTMLSelectElement
    small: HTMLElement
    source: HTMLSourceElement
    span: HTMLSpanElement
    strong: HTMLElement
    style: HTMLStyleElement
    sub: HTMLElement
    summary: HTMLElement
    sup: HTMLElement
    table: HTMLTableElement
    template: HTMLTemplateElement
    tbody: HTMLTableSectionElement
    td: HTMLTableDataCellElement
    textarea: HTMLTextAreaElement
    tfoot: HTMLTableSectionElement
    th: HTMLTableHeaderCellElement
    thead: HTMLTableSectionElement
    time: HTMLTimeElement
    title: HTMLTitleElement
    tr: HTMLTableRowElement
    track: HTMLTrackElement
    u: HTMLElement
    ul: HTMLUListElement
    var: HTMLElement
    video: HTMLVideoElement
    wbr: HTMLElement
    webview: HTMLWebViewElement
}

export interface TransformOrigin {
    originX?: number | string
    originY?: number | string
    originZ?: number | string
}

export interface HTMLRenderState {
    /**
     * A mutable record of transforms we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    transform: ResolvedValues

    /**
     * A mutable record of transform origins we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    transformOrigin: TransformOrigin

    /**
     * A mutable record of styles we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    style: ResolvedValues

    /**
     * A mutable record of CSS variables we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    vars: ResolvedValues
}

type AttributesWithoutMotionProps<Attributes> = {
    [K in Exclude<keyof Attributes, keyof MotionProps>]?: Attributes[K]
}

/**
 * @public
 */
export type ForwardRefComponent<T, P> = { readonly $$typeof: symbol } & ((
    props: PropsWithoutRef<P> & RefAttributes<T>
) => JSX.Element)
/**
 * @public
 */
export type HTMLMotionProps<Tag extends keyof HTMLElements> = MotionProps &
    // AttributesWithoutMotionProps<DOMAttributes<HTMLElements[Tag]>> &
    AttributesWithoutMotionProps<HTMLAttributes<HTMLElements[Tag]>>

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export type HTMLMotionComponents = {
    [Tag in keyof HTMLElements]: ForwardRefComponent<
        HTMLElements[Tag],
        HTMLMotionProps<Tag>
    >
}
