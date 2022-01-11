import * as React from "react";
import { MotionProps } from "../../motion/types";
import { MotionComponentConfig } from "../../motion";
/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 *
 * @internal
 */
export declare type CustomDomComponent<Props> = React.ForwardRefExoticComponent<React.PropsWithoutRef<Props & MotionProps> & React.RefAttributes<SVGElement | HTMLElement>>;
export interface CustomMotionComponentConfig {
    forwardMotionProps?: boolean;
}
export declare type CreateConfig = <Instance, RenderState, Props>(Component: string | React.ComponentType<Props>, config: CustomMotionComponentConfig) => MotionComponentConfig<Instance, RenderState>;
/**
 * Convert any React component into a `motion` component. The provided component
 * **must** use `React.forwardRef` to the underlying DOM component you want to animate.
 *
 * ```jsx
 * const Component = React.forwardRef((props, ref) => {
 *   return <div ref={ref} />
 * })
 *
 * const MotionComponent = motion(Component)
 * ```
 *
 * @public
 */
export declare function createMotionProxy(createConfig: CreateConfig): (<Props>(Component: string | React.ComponentType<Props>, customMotionComponentConfig?: CustomMotionComponentConfig) => CustomDomComponent<Props>) & import("../html/types").HTMLMotionComponents & import("../svg/types").SVGMotionComponents;
