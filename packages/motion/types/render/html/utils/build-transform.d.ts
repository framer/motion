import { DOMVisualElementOptions } from "../../dom/types";
import { MotionProps } from "../../../motion/types";
import { HTMLRenderState, TransformOrigin } from "../types";
/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export declare function buildTransform({ transform, transformKeys }: HTMLRenderState, { enableHardwareAcceleration, allowTransformNone, }: DOMVisualElementOptions, transformIsDefault: boolean, transformTemplate?: MotionProps["transformTemplate"]): string;
/**
 * Build a transformOrigin style. Uses the same defaults as the browser for
 * undefined origins.
 */
export declare function buildTransformOrigin({ originX, originY, originZ, }: TransformOrigin): string;
