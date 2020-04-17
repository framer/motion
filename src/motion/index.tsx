import { createMotionComponent, MotionProps } from "./component"
import { createDomMotionConfig } from "./features/dom"
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
import { HTMLElements, SVGElements } from "./utils/supported-elements"
import { MakeMotion } from "./types"

/**
 * These re-exports are to fix the "cannot be named" TypeScript errors.
 */
export { MotionContext } from "./context/MotionContext"
export { MotionValuesMap } from "./utils/use-motion-values"
export { ValueAnimationControls } from "../animation/ValueAnimationControls"
export { createMotionComponent }

/**
 * Convert any React component into a `motion` component. The provided component
 * **must** use `React.forwardRef` to the underlying DOM component you want to animate.
 *
 * ```jsx
 * const Component = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion.custom(Component)
 * ```
 *
 * @public
 */
function custom<Props>(Component: string | ComponentType<Props>) {
    return createMotionComponent<Props>(createDomMotionConfig(Component))
}

type CustomMotionComponent = { custom: typeof custom }
type Motion = HTMLMotionComponents & SVGMotionComponents & CustomMotionComponent

const componentCache = new Map<string, any>()
function getMotionComponent(target: CustomMotionComponent, key: string) {
    if (key === "custom") return target.custom

    if (!componentCache.has(key)) {
        componentCache.set(
            key,
            createMotionComponent(createDomMotionConfig(key))
        )
    }

    return componentCache.get(key)
}

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export const motion = new Proxy(
    { custom },
    { get: getMotionComponent }
) as Motion

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
