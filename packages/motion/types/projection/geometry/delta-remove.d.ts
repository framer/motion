import { ResolvedValues } from "../../render/types";
import { Axis, Box } from "./types";
/**
 * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
 */
export declare function removePointDelta(point: number, translate: number, scale: number, originPoint: number, boxScale?: number): number;
/**
 * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
 */
export declare function removeAxisDelta(axis: Axis, translate?: number | string, scale?: number, origin?: number, boxScale?: number, originAxis?: Axis, sourceAxis?: Axis): void;
/**
 * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export declare function removeAxisTransforms(axis: Axis, transforms: ResolvedValues, [key, scaleKey, originKey]: string[], origin?: Axis, sourceAxis?: Axis): void;
/**
 * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export declare function removeBoxTransforms(box: Box, transforms: ResolvedValues, originBox?: Box, sourceBox?: Box): void;
