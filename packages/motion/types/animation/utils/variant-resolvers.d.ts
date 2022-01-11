import { MotionValue } from "../../value";
declare type VariantNameList = string[];
declare type VariantName = string | VariantNameList;
declare type UnresolvedVariant = VariantName | MotionValue;
export declare const resolveVariantLabels: (variant?: UnresolvedVariant | undefined) => VariantNameList;
/**
 * Hooks in React sometimes accept a dependency array as their final argument. (ie useEffect/useMemo)
 * When values in this array change, React re-runs the dependency. However if the array
 * contains a variable number of items, React throws an error.
 */
export declare const asDependencyList: (list: VariantNameList) => string[];
export {};
