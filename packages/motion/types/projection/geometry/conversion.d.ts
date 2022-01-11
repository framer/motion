import { BoundingBox, Box, TransformPoint } from "./types";
/**
 * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
 * it's easier to consider each axis individually. This function returns a bounding box
 * as a map of single-axis min/max values.
 */
export declare function convertBoundingBoxToBox({ top, left, right, bottom, }: BoundingBox): Box;
export declare function convertBoxToBoundingBox({ x, y }: Box): BoundingBox;
/**
 * Applies a TransformPoint function to a bounding box. TransformPoint is usually a function
 * provided by Framer to allow measured points to be corrected for device scaling. This is used
 * when measuring DOM elements and DOM event points.
 */
export declare function transformBoxPoints(point: BoundingBox, transformPoint?: TransformPoint): BoundingBox;
