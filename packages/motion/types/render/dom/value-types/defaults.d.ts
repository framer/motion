import { ValueTypeMap } from "./types";
/**
 * A map of default value types for common values
 */
export declare const defaultValueTypes: ValueTypeMap;
/**
 * Gets the default ValueType for the provided value key
 */
export declare const getDefaultValueType: (key: string) => import("style-value-types").ValueType;
