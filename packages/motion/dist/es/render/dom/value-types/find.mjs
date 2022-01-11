import { __spreadArray, __read } from 'tslib';
import { color, complex } from 'style-value-types';
import { dimensionValueTypes } from './dimensions.mjs';
import { testValueType } from './test.mjs';

/**
 * A list of all ValueTypes
 */
var valueTypes = __spreadArray(__spreadArray([], __read(dimensionValueTypes), false), [color, complex], false);
/**
 * Tests a value against the list of ValueTypes
 */
var findValueType = function (v) { return valueTypes.find(testValueType(v)); };

export { findValueType };
