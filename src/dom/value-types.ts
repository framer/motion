import {
    number,
    degrees,
    percent,
    px,
    vw,
    vh,
    ValueType,
} from "style-value-types"

export const auto: ValueType = {
    test: (v: any) => v === "auto",
    parse: v => v,
}

const valueTypeTests = [number, px, percent, degrees, vw, vh, auto]
const testValueType = (v: any) => (type: ValueType) => type.test(v)

export const getValueType = (v: any) => valueTypeTests.find(testValueType(v))
