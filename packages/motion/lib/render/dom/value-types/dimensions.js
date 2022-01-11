import { degrees, number, percent, px, vh, vw } from "style-value-types";
import { testValueType } from "./test";
import { auto } from "./type-auto";
/**
 * A list of value types commonly used for dimensions
 */
export var dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
export var findDimensionValueType = function (v) {
    return dimensionValueTypes.find(testValueType(v));
};
//# sourceMappingURL=dimensions.js.map