import {
    ReactHTML,
    DetailedHTMLFactory,
    HTMLAttributes,
    PropsWithoutRef,
    RefAttributes,
    ForwardRefExoticComponent,
} from "react"
import { HTMLElements, htmlElements } from "./utils/supported-elements"
import { createMotionComponent } from "motion"
import { createDomMotionConfig } from "./functionality/dom"
import { MotionProps } from "./types"

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
export type HTMLMotionProps<
    TagName extends keyof ReactHTML
> = HTMLAttributesWithoutMotionProps<
    UnwrapFactoryAttributes<ReactHTML[TagName]>,
    UnwrapFactoryElement<ReactHTML[TagName]>
> &
    MotionProps

type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
    PropsWithoutRef<P> & RefAttributes<T>
>

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

export const htmlMotionComponents = htmlElements.map(Component => {
    return createMotionComponent(createDomMotionConfig(Component))
})
