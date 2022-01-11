import { CustomValueType, ValueTarget, SingleTarget } from "../types";
export declare const isCustomValue: (v: any) => v is CustomValueType;
export declare const resolveFinalValueInKeyframes: (v: ValueTarget) => SingleTarget;
