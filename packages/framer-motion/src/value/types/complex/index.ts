import { CSSVariableToken } from "../../../render/dom/utils/is-css-variable"
import { isNumericalString } from "../../../utils/is-numerical-string"
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

type ComplexValues = Array<CSSVariableToken | Color | number>

export interface ComplexValueInfo {
    values: ComplexValues
    split: string[]
}

const complexRegex =
    /(var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\))|(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))|((-)?([\d]*\.?[\d])+)/gi

const splitToken = "${}"

export function analyseComplexValue(value: string | number): ComplexValueInfo {
    const originalValue = value.toString()

    const matchedValues = originalValue.match(complexRegex)
    const values: ComplexValues =
        matchedValues === null ? [] : (matchedValues as ComplexValues)

    /**
     * match() returns strings - convert numerical strings to actual numbers.
     */
    for (let i = 0; i < values?.length; i++) {
        if (isNumericalString(values[i] as string)) {
            values[i] = parseFloat(values[i] as string)
        }
    }

    const tokenised = originalValue.replace(complexRegex, splitToken)
    const split = tokenised.split(splitToken)

    return { values, split }
}

function parseComplexValue(v: string | number) {
    return analyseComplexValue(v).values
}

function createTransformer(source: string | number) {
    const { split } = analyseComplexValue(source)

    const numSections = split.length
    return (v: Array<CSSVariableToken | Color | number | string>) => {
        let output = ""
        for (let i = 0; i < numSections; i++) {
            output += split[i]
            if (v[i] !== undefined) {
                output += typeof v === "number" ? sanitize(v[i]) : v[i]
            }
        }

        return output
    }
}

const convertNumbersToZero = (v: number | Color) =>
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
