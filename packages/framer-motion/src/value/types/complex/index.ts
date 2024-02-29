import { CSSVariableToken } from "../../../render/dom/utils/is-css-variable"
import { color } from "../color"
import { Color } from "../types"
import { colorRegex, floatRegex, isString, sanitize } from "../utils"

function test(v: any) {
    return (
        isNaN(v) &&
        isString(v) &&
        (v.match(floatRegex)?.length || 0) +
            (v.match(colorRegex)?.length || 0) >
            0
    )
}

const NUMBER_TOKEN = "number"
const COLOR_TOKEN = "color"
const VAR_TOKEN = "var"
const VAR_FUNCTION_TOKEN = "var("
const SPLIT_TOKEN = "${}"

export type ComplexValues = Array<CSSVariableToken | string | number | Color>

export type ValueIndexes = {
    color: number[]
    number: number[]
    var: number[]
}

export interface ComplexValueInfo {
    values: ComplexValues
    split: string[]
    indexes: ValueIndexes
    types: Array<keyof ValueIndexes>
}

const complexRegex =
    /(var\s*\(\s*--[\w-]+(\s*,(?:[^)(]|\((?:[^)(]|\([^)(]*\))*\))*)?\s*\))|(#[\da-f]{3,8}|(rgb|hsl)a?\((-?[\d.]+%?[,\s]+){2}(-?[\d.]+%?)\s*(?:[,/]\s*)?[\d.]*%?\))|((-)?(\d*\.?\d)+)/gi

export function analyseComplexValue(value: string | number): ComplexValueInfo {
    const originalValue = value.toString()

    const matchedValues = originalValue.match(complexRegex) || []
    const values: ComplexValues = []
    const indexes: ValueIndexes = {
        color: [],
        number: [],
        var: [],
    }
    const types: Array<keyof ValueIndexes> = []

    for (let i = 0; i < matchedValues.length; i++) {
        const parsedValue: string | number = matchedValues[i]

        if (color.test(parsedValue)) {
            indexes.color.push(i)
            types.push(COLOR_TOKEN)
            values.push(color.parse(parsedValue))
        } else if (parsedValue.startsWith(VAR_FUNCTION_TOKEN)) {
            indexes.var.push(i)
            types.push(VAR_TOKEN)
            values.push(parsedValue)
        } else {
            indexes.number.push(i)
            types.push(NUMBER_TOKEN)
            values.push(parseFloat(parsedValue))
        }
    }

    const tokenised = originalValue.replace(complexRegex, SPLIT_TOKEN)
    const split = tokenised.split(SPLIT_TOKEN)

    return { values, split, indexes, types }
}

function parseComplexValue(v: string | number) {
    return analyseComplexValue(v).values
}

function createTransformer(source: string | number) {
    const { split, types } = analyseComplexValue(source)

    const numSections = split.length
    return (v: Array<CSSVariableToken | Color | number | string>) => {
        let output = ""
        for (let i = 0; i < numSections; i++) {
            output += split[i]
            if (v[i] !== undefined) {
                const type = types[i]
                if (type === NUMBER_TOKEN) {
                    output += sanitize(v[i] as number)
                } else if (type === COLOR_TOKEN) {
                    output += color.transform(v[i] as Color)
                } else {
                    output += v[i]
                }
            }
        }

        return output
    }
}

const convertNumbersToZero = (v: number | string) =>
    typeof v === "number" ? 0 : v

function getAnimatableNone(v: string | number) {
    const parsed = parseComplexValue(v)
    const transformer = createTransformer(v)
    return transformer(parsed.map(convertNumbersToZero))
}

export const complex = {
    test,
    parse: parseComplexValue,
    createTransformer,
    getAnimatableNone,
}
