/**
 * A list of value types commonly used for dimensions
 */
export declare const dimensionValueTypes: import("style-value-types").ValueType[];
/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
export declare const findDimensionValueType: (v: any) => import("style-value-types").ValueType | undefined;
