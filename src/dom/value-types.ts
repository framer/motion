import {
    number,
    degrees,
    percent,
    px,
    vw,
    vh,
    color,
    complex,
    ValueType,
} from "style-value-types"

export const auto: ValueType = {
    test: (v: any) => v === "auto",
    parse: v => v,
}

const dimensionTypes = [number, px, percent, degrees, vw, vh, auto]
const valueTypes = [...dimensionTypes, color, complex]

const testValueType = (v: any) => (type: ValueType) => type.test(v)

export const getDimensionValueType = (v: any) =>
    dimensionTypes.find(testValueType(v))

export const getValueType = (v: any) => valueTypes.find(testValueType(v))
