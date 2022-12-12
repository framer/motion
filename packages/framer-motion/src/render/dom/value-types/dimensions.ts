import { number } from "../../../value/types/numbers"
import {
    degrees,
    percent,
    px,
    vh,
    vw,
} from "../../../value/types/numbers/units"
import { testValueType } from "./test"
import { auto } from "./type-auto"

/**
 * A list of value types commonly used for dimensions
 */
export const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto]

/**
 * Tests a dimensional value against the list of dimension ValueTypes
 */
export const findDimensionValueType = (v: any) =>
    dimensionValueTypes.find(testValueType(v))
