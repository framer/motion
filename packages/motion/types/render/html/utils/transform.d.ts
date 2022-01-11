/**
 * A list of all transformable axes. We'll use this list to generated a version
 * of each axes for each transform.
 */
export declare const transformAxes: string[];
/**
 * Generate a list of every possible transform key.
 */
export declare const transformProps: string[];
/**
 * A function to use with Array.sort to sort transform keys by their default order.
 */
export declare function sortTransformProps(a: string, b: string): number;
export declare function isTransformProp(key: string): boolean;
export declare function isTransformOriginProp(key: string): boolean;
