import {
    DetailedHTMLFactory,
    ForwardRefExoticComponent,
    HTMLAttributes,
    PropsWithoutRef,
    ReactHTML,
    RefAttributes,
    SVGAttributes,
} from "react"
import { MakeMotion, MotionProps } from "../../motion/types"
import { TransformPoint2D } from "../../types/geometry"
import { ResolvedValues } from "../types"
import { HTMLElements, SVGElements } from "./utils/supported-elements"

export interface DOMVisualElementOptions {
    transformPagePoint?: TransformPoint2D
    allowTransformNone?: boolean
    enableHardwareAcceleration?: boolean
}

export interface HTMLMutableState {
    /**
     * A mutable record of transforms we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    transform: ResolvedValues

    /**
     * A mutable record of transform keys we want to apply to the rendered Element. We order
     * this to order transforms in the desired order. We use a mutable data structure to reduce GC during animations.
     */
    transformKeys: string[]

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

export interface SVGMutableState extends HTMLMutableState {
    /**
     * Measured dimensions of the SVG element to be used to calculate a transform-origin.
     */
    dimensions: SVGDimensions

    /**
     * A mutable record of attributes we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    attrs: ResolvedValues

    /**
     * Measured path length if this is a SVGPathElement
     */
    totalPathLength?: number
}

export type SVGDimensions = {
    x: number
    y: number
    width: number
    height: number
}

export interface TransformOrigin {
    originX?: number | string
    originY?: number | string
    originZ?: number | string
}

/**
 * Support for React component props
 */
type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any>
    ? P
    : never
type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P>
    ? P
    : never
type UnwrapSVGFactoryElement<F> = F extends React.SVGProps<infer P> ? P : never

type HTMLAttributesWithoutMotionProps<
    Attributes extends HTMLAttributes<Element>,
    Element extends HTMLElement
> = { [K in Exclude<keyof Attributes, keyof MotionProps>]?: Attributes[K] }

/**
 * @public
 */
export type HTMLMotionProps<
    TagName extends keyof ReactHTML
> = HTMLAttributesWithoutMotionProps<
    UnwrapFactoryAttributes<ReactHTML[TagName]>,
    UnwrapFactoryElement<ReactHTML[TagName]>
> &
    MotionProps

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export type HTMLMotionComponents = {
    [K in HTMLElements]: ForwardRefComponent<
        UnwrapFactoryElement<ReactHTML[K]>,
        HTMLMotionProps<K>
    >
}

interface SVGAttributesWithoutMotionProps<T>
    extends Pick<
        SVGAttributes<T>,
        Exclude<keyof SVGAttributes<T>, keyof MotionProps>
    > {}

/**
 * Blanket-accept any SVG attribute as a `MotionValue`
 * @public
 */
export type SVGAttributesAsMotionValues<T> = MakeMotion<
    SVGAttributesWithoutMotionProps<T>
>

/**
 * @public
 */
export interface SVGMotionProps<T>
    extends SVGAttributesAsMotionValues<T>,
        MotionProps {}

/**
 * @public
 */
export type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
    PropsWithoutRef<P> & RefAttributes<T>
>

/**
 * Motion-optimised versions of React's SVG components.
 *
 * @public
 */
export type SVGMotionComponents = {
    [K in SVGElements]: ForwardRefComponent<
        UnwrapSVGFactoryElement<JSX.IntrinsicElements[K]>,
        SVGMotionProps<UnwrapSVGFactoryElement<JSX.IntrinsicElements[K]>>
    >
}
