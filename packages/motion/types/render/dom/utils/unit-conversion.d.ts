import { Target, TargetWithKeyframes } from "../../../types";
import { VisualElement } from "../../types";
import { Box } from "../../../projection/geometry/types";
export declare enum BoundingBoxDimension {
    width = "width",
    height = "height",
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom"
}
declare type GetActualMeasurementInPixels = (bbox: Box, computedStyle: Partial<CSSStyleDeclaration>) => number;
export declare const positionalValues: {
    [key: string]: GetActualMeasurementInPixels;
};
/**
 * Convert value types for x/y/width/height/top/left/bottom/right
 *
 * Allows animation between `'auto'` -> `'100%'` or `0` -> `'calc(50% - 10vw)'`
 *
 * @internal
 */
export declare function unitConversion(visualElement: VisualElement, target: TargetWithKeyframes, origin?: Target, transitionEnd?: Target): {
    target: TargetWithKeyframes;
    transitionEnd?: Target;
};
export {};
