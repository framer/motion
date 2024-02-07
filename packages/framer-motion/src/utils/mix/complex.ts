import { mixNumber as mixNumberImmediate } from "./number"
import { mixColor } from "./color"
import { pipe } from "../pipe"
import { warning } from "../errors"
import { HSLA, RGBA } from "../../value/types/types"
import { color } from "../../value/types/color"
import { analyseComplexValue, complex } from "../../value/types/complex"

type MixableArray = Array<number | RGBA | HSLA | string>
type MixableObject = {
    [key: string]: string | number | RGBA | HSLA
}

function mixImmediate<T>(a: T, b: T) {
    return (p: number) => (p > 0 ? b : a)
}

function mixNumber(a: number, b: number) {
    return (p: number) => mixNumberImmediate(a, b, p)
}

export function getMixer<T>(a: T) {
    if (typeof a === "number") {
        return mixNumber
    } else if (typeof a === "string") {
        if (a.startsWith("var(") || a.startsWith("url(")) {
            return mixImmediate
        } else if (color.test(a)) {
            return mixColor
        }
        return mixComplex
    } else if (Array.isArray(a)) {
        return mixArray
    } else if (typeof a === "object") {
        return mixObject
    }

    return mixImmediate
}

export function mixArray(a: MixableArray, b: MixableArray) {
    const output = [...a]
    const numValues = output.length

    const blendValue = a.map((v, i) => getMixer(v)(v as any, b[i] as any))

    return (p: number) => {
        for (let i = 0; i < numValues; i++) {
            output[i] = blendValue[i](p) as any
        }
        return output
    }
}

export function mixObject(a: MixableObject, b: MixableObject) {
    const output = { ...a, ...b }
    const blendValue: { [key: string]: (v: number) => any } = {}

    for (const key in output) {
        if (a[key] !== undefined && b[key] !== undefined) {
            blendValue[key] = getMixer(a[key])(
                a[key] as any,
                b[key] as any
            ) as any
        }
    }

    return (v: number) => {
        for (const key in blendValue) {
            output[key] = blendValue[key](v)
        }
        return output
    }
}

export const mixComplex = (
    origin: string | number,
    target: string | number
) => {
    const template = complex.createTransformer(target)
    const originStats = analyseComplexValue(origin)
    const targetStats = analyseComplexValue(target)

    const canInterpolate =
        originStats.values &&
        targetStats.values &&
        originStats.values.length === targetStats.values.length

    if (canInterpolate) {
        return pipe(mixArray(originStats.values, targetStats.values), template)
    } else {
        warning(
            true,
            `Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`
        )

        return mixImmediate(origin, target)
    }
}
