import {
    ReactHTML,
    DetailedHTMLFactory,
    HTMLAttributes,
    PropsWithoutRef,
    RefAttributes,
    SVGAttributes,
    ForwardRefExoticComponent,
} from "react"
import { MotionProps, MakeMotion } from "../../motion/types"
import { TransformPoint2D } from "../../types/geometry"
import { HTMLElements, SVGElements } from "./utils/supported-elements"
import { VisualElementConfig } from "../VisualElement/types"

/**
 * Configuration for the HTML and SVGVisualElement renderers.
 */
export interface DOMVisualElementConfig extends VisualElementConfig {
    /**
     * Whether to permit `transform: none` if the calculated transform equals zero.
     */
    allowTransformNone?: boolean

    /**
     * Whether to enable hardware acceleration. This will force the layer to the GPU
     * by setting `translateZ(0)` to the transform style.
     */
    enableHardwareAcceleration?: boolean

    /**
     * An optional function that can take a page point and return a new one.
     * Used to enable drag and layout animations in the scaled canvases of Framer Desktop preview.
     */
    transformPagePoint?: TransformPoint2D

    /**
     * A function that can accept the generated transform property and return a new one.
     * Used for custom transform property orders. In the medium-term I'd like to ditch this
     * and replace with a template function that can scoop up other animated values so
     * we can do, for instance:
     *
     * ```jsx
     * <motion.div
     *   animate={{ blur: 20 }}
     *   style={{ filter: combine`blur(${"blur"}px)` }}
     * />
     * ```
     */
    transformTemplate?: MotionProps["transformTemplate"]

    transformValues?: MotionProps["transformValues"]

    transition?: MotionProps["transition"]

    safeToRemove?: () => void
}

export interface TransformOrigin {
    originX?: number | string
    originY?: number | string
    originZ?: number | string
}

/**
 * Measured dimensions of an SVG component.
 * TODO: Look into replacing this with AxisBox2D when we port over magic motion
 */
export type Dimensions = {
    x: number
    y: number
    width: number
    height: number
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
