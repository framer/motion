import { HTMLRenderState } from "./types";
import { VisualElementConfig } from "../types";
import { DOMVisualElementOptions } from "../dom/types";
export declare function getComputedStyle(element: HTMLElement): CSSStyleDeclaration;
export declare const htmlConfig: VisualElementConfig<HTMLElement, HTMLRenderState, DOMVisualElementOptions>;
export declare const htmlVisualElement: ({ parent, props, presenceId, blockInitialAnimation, visualState, }: import("../types").VisualElementOptions<HTMLElement, any>, options?: DOMVisualElementOptions) => import("../types").VisualElement<HTMLElement, any>;
