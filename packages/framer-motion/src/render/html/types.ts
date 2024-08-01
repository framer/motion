import { ResolvedValues } from "../types"
import {
    DetailedHTMLFactory,
    HTMLAttributes,
    PropsWithoutRef,
    ReactHTML,
    RefAttributes,
} from "react"
import { MotionProps } from "../../motion/types"
import { HTMLElements } from "./supported-elements"

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

/**
 * @public
 */
export type ForwardRefComponent<T, P> = { readonly $$typeof: symbol } & ((
    props: PropsWithoutRef<P> & RefAttributes<T>
) => JSX.Element)

/**
 * Support for React component props
 */
type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any>
    ? P
    : never
type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P>
    ? P
    : never

type HTMLAttributesWithoutMotionProps<
    Attributes extends HTMLAttributes<Element>,
    Element extends HTMLElement
> = { [K in Exclude<keyof Attributes, keyof MotionProps>]?: Attributes[K] }

/**
 * @public
 */
export type HTMLMotionProps<TagName extends keyof ReactHTML> =
    HTMLAttributesWithoutMotionProps<
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
