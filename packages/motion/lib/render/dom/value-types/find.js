import { __read, __spreadArray } from "tslib";
import { color, complex } from "style-value-types";
import { dimensionValueTypes } from "./dimensions";
import { testValueType } from "./test";
/**
 * A list of all ValueTypes
 */
var valueTypes = __spreadArray(__spreadArray([], __read(dimensionValueTypes), false), [color, complex], false);
/**
 * Tests a value against the list of ValueTypes
 */
export var findValueType = function (v) { return valueTypes.find(testValueType(v)); };
//# sourceMappingURL=find.js.map