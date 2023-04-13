import {
    cssVariableRegex,
    CSSVariableToken,
} from "../../../render/dom/utils/is-css-variable"
import { color } from "../color"
import { number } from "../numbers"
import { Color } from "../types"
import { colorRegex, floatRegex, isString, sanitize } from "../utils"

const varToken = "${v}"
const colorToken = "${c}"
const numberToken = "${n}"

function test(v: any) {
    return (
        isNaN(v) &&
        isString(v) &&
        (v.match(floatRegex)?.length || 0) +
            (v.match(colorRegex)?.length || 0) >
            0
    )
}

export function analyseComplexValue(v: string | number) {
    if (typeof v === "number") v = `${v}`

    const values: Array<CSSVariableToken | Color | number> = []
    let numVars = 0
    let numColors = 0
    let numNumbers = 0

    const containsCSSVars = v.includes("var(--")
    if (containsCSSVars) {
        const vars = v.match(cssVariableRegex) as null | CSSVariableToken[]
        console.log(vars)
        if (vars) {
            numVars = vars.length
            v = v.replace(cssVariableRegex, varToken)
            values.push(...vars)
        }
    }

    const colors = v.match(colorRegex)
    if (colors) {
        numColors = colors.length
        // Strip colors from input so they're not picked up by number regex.
        // There's a better way to combine these regex searches, but its beyond my regex skills
        v = v.replace(colorRegex, colorToken)
        values.push(...(colors.map(color.parse) as any))
    }

    const numbers = v.match(floatRegex)
    if (numbers) {
        numNumbers = numbers.length
        v = v.replace(floatRegex, numberToken)
        values.push(...numbers.map(number.parse))
    }
    console.log({ v, values })
    return {
        values,
        numVars,
        numColors,
        numNumbers,
        tokenised: v,
        containsCSSVars: v.includes("var(--"),
    }
}

function parse(v: string | number) {
    return analyseComplexValue(v).values
}

function createTransformer(source: string | number) {
    const { values, numColors, numVars, tokenised } =
        analyseComplexValue(source)
    const numValues = values.length

    return (v: Array<CSSVariableToken | Color | number | string>) => {
        let output = tokenised

        for (let i = 0; i < numValues; i++) {
            if (i < numVars) {
                output = output.replace(varToken, v[i] as any)
            } else if (i < numVars + numColors) {
                output = output.replace(
                    colorToken,
                    color.transform(v[i] as any)
                )
            } else {
                output = output.replace(
                    numberToken,
                    sanitize(v[i] as number) as any
                )
            }
        }

        return output
    }
}

const convertNumbersToZero = (v: number | Color) =>
    typeof v === "number" ? 0 : v

function getAnimatableNone(v: string | number) {
    const parsed = parse(v)
    const transformer = createTransformer(v)
    return transformer(parsed.map(convertNumbersToZero))
}

export const complex = { test, parse, createTransformer, getAnimatableNone }
