import { ResolvedValues } from "../../types";
/**
 * Build SVG path properties. Uses the path's measured length to convert
 * our custom pathLength, pathSpacing and pathOffset into stroke-dashoffset
 * and stroke-dasharray attributes.
 *
 * This function is mutative to reduce per-frame GC.
 */
export declare function buildSVGPath(attrs: ResolvedValues, length: number, spacing?: number, offset?: number, useDashCase?: boolean): void;
