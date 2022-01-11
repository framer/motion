import { DOMVisualElementOptions } from "../../dom/types";
import { ResolvedValues } from "../../types";
import { MotionProps } from "../../../motion/types";
import { SVGRenderState } from "../types";
/**
 * Build SVG visual attrbutes, like cx and style.transform
 */
export declare function buildSVGAttrs(state: SVGRenderState, { attrX, attrY, originX, originY, pathLength, pathSpacing, pathOffset, ...latest }: ResolvedValues, options: DOMVisualElementOptions, transformTemplate?: MotionProps["transformTemplate"]): void;
