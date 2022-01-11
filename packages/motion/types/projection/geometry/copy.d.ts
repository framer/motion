import { Axis, Box } from "./types";
/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
export declare function copyAxisInto(axis: Axis, originAxis: Axis): void;
/**
 * Reset a box to the provided origin box.
 *
 * This is a mutative operation.
 */
export declare function copyBoxInto(box: Box, originBox: Box): void;
