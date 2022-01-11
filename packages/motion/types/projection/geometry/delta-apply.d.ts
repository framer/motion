import { ResolvedValues } from "../../render/types";
import { IProjectionNode } from "../node/types";
import { Axis, Box, Delta, Point } from "./types";
/**
 * Scales a point based on a factor and an originPoint
 */
export declare function scalePoint(point: number, scale: number, originPoint: number): number;
/**
 * Applies a translate/scale delta to a point
 */
export declare function applyPointDelta(point: number, translate: number, scale: number, originPoint: number, boxScale?: number): number;
/**
 * Applies a translate/scale delta to an axis
 */
export declare function applyAxisDelta(axis: Axis, translate: number | undefined, scale: number | undefined, originPoint: number, boxScale?: number): void;
/**
 * Applies a translate/scale delta to a box
 */
export declare function applyBoxDelta(box: Box, { x, y }: Delta): void;
/**
 * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
 * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
 *
 * This is the final nested loop within updateLayoutDelta for future refactoring
 */
export declare function applyTreeDeltas(box: Box, treeScale: Point, treePath: IProjectionNode[], isSharedTransition?: boolean): void;
export declare function translateAxis(axis: Axis, distance: number): void;
/**
 * Apply a transform to an axis from the latest resolved motion values.
 * This function basically acts as a bridge between a flat motion value map
 * and applyAxisDelta
 */
export declare function transformAxis(axis: Axis, transforms: ResolvedValues, [key, scaleKey, originKey]: string[]): void;
/**
 * Apply a transform to a box from the latest resolved motion values.
 */
export declare function transformBox(box: Box, transform: ResolvedValues): void;
