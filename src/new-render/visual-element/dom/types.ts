import {
    DetailedHTMLFactory,
    ForwardRefExoticComponent,
    HTMLAttributes,
    PropsWithoutRef,
    ReactHTML,
    RefAttributes,
    SVGAttributes,
} from "react"
import { MakeMotion, MotionProps } from "../../../motion/types"
import { VisualElementOptions } from "../types"
import { HTMLElements, SVGElements } from "./utils/supported-elements"

export interface DOMVisualElementOptions extends VisualElementOptions {
    enableHardwareAcceleration: boolean
}

// import {} from "react"
// import { TransformPoint2D } from "../../types/geometry"
// import { HTMLElements, SVGElements } from "./utils/supported-elements"
// import { VisualElementConfig } from "../VisualElement/types"

// export interface TransformOrigin {
//     originX?: number | string
//     originY?: number | string
//     originZ?: number | string
// }

// /**
//  * Measured dimensions of an SVG component.
//  * TODO: Look into replacing this with AxisBox2D when we port over magic motion
//  */
// export type Dimensions = {
//     x: number
//     y: number
//     width: number
//     height: number
// }

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
