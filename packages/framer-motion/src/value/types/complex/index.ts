import {
    cssVariableRegex,
    CSSVariableToken,
} from "../../../render/dom/utils/is-css-variable"
import { noop } from "../../../utils/noop"
import { color } from "../color"
import { number } from "../numbers"
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

export interface ComplexValueInfo {
    value: string
    values: Array<CSSVariableToken | Color | number>
    numVars: number
    numColors: number
    numNumbers: number
    tokenised: string
}

interface Tokeniser {
    regex: RegExp
    countKey: string
    token: string
    parse: (value: string) => any
}

const cssVarTokeniser: Tokeniser = {
    regex: cssVariableRegex,
    countKey: "Vars",
    token: "${v}",
    parse: noop,
}

const colorTokeniser: Tokeniser = {
    regex: colorRegex,
    countKey: "Colors",
    token: "${c}",
    parse: color.parse,
}

const numberTokeniser: Tokeniser = {
    regex: floatRegex,
    countKey: "Numbers",
    token: "${n}",
    parse: number.parse,
}

function tokenise(
    info: ComplexValueInfo,
    { regex, countKey, token, parse }: Tokeniser
) {
    const matches = info.value.match(regex)

    if (!matches) return

    info["num" + countKey] = matches.length
    info.value = info.value.replace(regex, token)
    info.values.push(...(matches.map(parse) as any))
}

export function analyseComplexValue(value: string | number): ComplexValueInfo {
    const info = {
        value: typeof value === "number" ? "" + value : value,
        values: [],
        numVars: 0,
        numColors: 0,
        numNumbers: 0,
        tokenised: "",
    }

    if (info.value.includes("var(--")) tokenise(info, cssVarTokeniser)
    tokenise(info, colorTokeniser)
    tokenise(info, numberTokeniser)

    return info
}

function parseComplexValue(v: string | number) {
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
                output = output.replace(cssVarTokeniser.token, v[i] as any)
            } else if (i < numVars + numColors) {
                output = output.replace(
                    colorTokeniser.token,
                    color.transform(v[i] as any)
                )
            } else {
                output = output.replace(
                    numberTokeniser.token,
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
