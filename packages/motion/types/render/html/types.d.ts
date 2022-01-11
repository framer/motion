import { ResolvedValues } from "../types";
import { DetailedHTMLFactory, ForwardRefExoticComponent, HTMLAttributes, PropsWithoutRef, ReactHTML, RefAttributes } from "react";
import { MotionProps } from "../../motion/types";
import { HTMLElements } from "./supported-elements";
export interface TransformOrigin {
    originX?: number | string;
    originY?: number | string;
    originZ?: number | string;
}
export interface HTMLRenderState {
    /**
     * A mutable record of transforms we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    transform: ResolvedValues;
    /**
     * A mutable record of transform keys we want to apply to the rendered Element. We order
     * this to order transforms in the desired order. We use a mutable data structure to reduce GC during animations.
     */
    transformKeys: string[];
    /**
     * A mutable record of transform origins we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    transformOrigin: TransformOrigin;
    /**
     * A mutable record of styles we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    style: ResolvedValues;
    /**
     * A mutable record of CSS variables we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    vars: ResolvedValues;
}
/**
 * @public
 */
export declare type ForwardRefComponent<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
/**
 * Support for React component props
 */
declare type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never;
declare type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P> ? P : never;
declare type HTMLAttributesWithoutMotionProps<Attributes extends HTMLAttributes<Element>, Element extends HTMLElement> = {
    [K in Exclude<keyof Attributes, keyof MotionProps>]?: Attributes[K];
};
/**
 * @public
 */
export declare type HTMLMotionProps<TagName extends keyof ReactHTML> = HTMLAttributesWithoutMotionProps<UnwrapFactoryAttributes<ReactHTML[TagName]>, UnwrapFactoryElement<ReactHTML[TagName]>> & MotionProps;
/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export declare type HTMLMotionComponents = {
    [K in HTMLElements]: ForwardRefComponent<UnwrapFactoryElement<ReactHTML[K]>, HTMLMotionProps<K>>;
};
export {};
