import { number, px, percent, degrees, vw, vh } from 'style-value-types';
import { testValueType } from './test.mjs';
import { auto } from './type-auto.mjs';

/**
 * A list of value types commonly used for dimensions
 */
var dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
var findDimensionValueType = function (v) {
    return dimensionValueTypes.find(testValueType(v));
};

export { dimensionValueTypes, findDimensionValueType };
