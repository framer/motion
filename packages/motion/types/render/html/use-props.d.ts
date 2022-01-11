import { MotionProps } from "../../motion/types";
import { MotionValue } from "../../value";
import { ResolvedValues } from "../types";
export declare function copyRawValuesOnly(target: ResolvedValues, source: {
    [key: string]: string | number | MotionValue;
}, props: MotionProps): void;
export declare function useStyle(props: MotionProps, visualState: ResolvedValues, isStatic: boolean): ResolvedValues;
export declare function useHTMLProps(props: MotionProps, visualState: ResolvedValues, isStatic: boolean): any;
