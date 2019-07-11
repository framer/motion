import { createMotionComponent } from "./component"
import { createDomMotionConfig } from "./functionality/dom"
import {
    ComponentType,
    ReactHTML,
    DetailedHTMLFactory,
    HTMLAttributes,
    PropsWithoutRef,
    RefAttributes,
    SVGAttributes,
    ForwardRefExoticComponent,
} from "react"
import { HTMLElements, htmlElements } from "./utils/supported-elements"
import { svgElements, SVGElements } from "./utils/supported-elements"
import { MotionProps, MakeMotion } from "./types"
import { Omit } from "../types"

export { MotionContext } from "./context/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { useExternalRef } from "./utils/use-external-ref"
export { ValueAnimationControls } from "../animation/ValueAnimationControls"
export { createMotionComponent }

export const htmlMotionComponents: HTMLMotionComponents = htmlElements.reduce(
    (acc, Component) => {
        const config = createDomMotionConfig(Component)
        // Suppress "Expression produces a union type that is too complex to represent" error
        // @ts-ignore
        acc[Component] = createMotionComponent(config)
        return acc
    },
    {} as HTMLMotionComponents
)

export const svgMotionComponents: SVGMotionComponents = svgElements.reduce(
    (acc, Component) => {
        // Suppress "Expression produces a union type that is too complex to represent" error
        // @ts-ignore
        acc[Component] = createMotionComponent(createDomMotionConfig(Component))
        return acc
    },
    {} as SVGMotionComponents
)

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @internalremarks
 *
 * I'd like to make it possible for these to be loaded "on demand" - to reduce bundle size by only
 * including HTML/SVG stylers, animation and/or gesture support when necessary.
 *
 * ```jsx
 * <motion.div animate={{ x: 100 }} />
 *
 * <motion.p animate={{ height: 200 }} />
 *
 * <svg><motion.circle r={10} animate={{ r: 20 }} /></svg>
 * ```
 *
 * @public
 */
export const motion = {
    custom: (Component: ComponentType<any>) => {
        return createMotionComponent(createDomMotionConfig(Component))
    },
    ...htmlMotionComponents,
    ...svgMotionComponents,
}

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
        Omit<MotionProps, "positionTransition"> {}

type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
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
