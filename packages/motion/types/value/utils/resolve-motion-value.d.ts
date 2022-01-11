import { MotionValue } from "..";
import { CustomValueType } from "../../types";
/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 *
 * @internal
 */
export declare function resolveMotionValue(value?: string | number | CustomValueType | MotionValue): string | number;
