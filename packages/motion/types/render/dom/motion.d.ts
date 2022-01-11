/// <reference types="react" />
import { DOMMotionComponents } from "./types";
/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export declare const motion: (<Props>(Component: string | import("react").ComponentType<Props>, customMotionComponentConfig?: import("./motion-proxy").CustomMotionComponentConfig) => import("./motion-proxy").CustomDomComponent<Props>) & import("../html/types").HTMLMotionComponents & import("../svg/types").SVGMotionComponents;
/**
 * Create a DOM `motion` component with the provided string. This is primarily intended
 * as a full alternative to `motion` for consumers who have to support environments that don't
 * support `Proxy`.
 *
 * ```javascript
 * import { createDomMotionComponent } from "framer-motion"
 *
 * const motion = {
 *   div: createDomMotionComponent('div')
 * }
 * ```
 *
 * @public
 */
export declare function createDomMotionComponent<T extends keyof DOMMotionComponents>(key: T): DOMMotionComponents[T];
