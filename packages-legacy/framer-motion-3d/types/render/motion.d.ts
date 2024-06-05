/// <reference types="react" />
import type { ThreeMotionComponents } from "../types";
declare function custom<Props extends {}>(Component: string): import("react").ForwardRefExoticComponent<import("react").PropsWithoutRef<Props & import("framer-motion").MotionProps> & import("react").RefAttributes<any>>;
export declare const motion: typeof custom & ThreeMotionComponents;
export {};
