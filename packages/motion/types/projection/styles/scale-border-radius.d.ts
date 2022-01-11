import { Axis } from "../geometry/types";
import { ScaleCorrectorDefinition } from "./types";
export declare function pixelsToPercent(pixels: number, axis: Axis): number;
/**
 * We always correct borderRadius as a percentage rather than pixels to reduce paints.
 * For example, if you are projecting a box that is 100px wide with a 10px borderRadius
 * into a box that is 200px wide with a 20px borderRadius, that is actually a 10%
 * borderRadius in both states. If we animate between the two in pixels that will trigger
 * a paint each time. If we animate between the two in percentage we'll avoid a paint.
 */
export declare const correctBorderRadius: ScaleCorrectorDefinition;
