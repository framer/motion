import { mix } from "./mix"
import { mixColor } from "./mix-color"
import { pipe } from "./pipe"
import { warning } from "../utils/errors"
import { HSLA, RGBA } from "../value/types/types"
import { color } from "../value/types/color"
import { analyseComplexValue, complex } from "../value/types/complex"

type MixComplex = (p: number) => string

type BlendableArray = Array<number | RGBA | HSLA | string>
type BlendableObject = {
    [key: string]: string | number | RGBA | HSLA
}

function getMixer(origin: any, target: any) {
    if (typeof origin === "number") {
        return (v: number) => mix(origin, target as number, v)
    } else if (color.test(origin)) {
        return mixColor(origin, target as HSLA | RGBA | string)
    } else {
        return mixComplex(origin as string, target as string)
    }
}

export const mixArray = (from: BlendableArray, to: BlendableArray) => {
    const output = [...from]
    const numValues = output.length

    const blendValue = from.map((fromThis, i) => getMixer(fromThis, to[i]))

    return (v: number) => {
        for (let i = 0; i < numValues; i++) {
            output[i] = blendValue[i](v)
        }
        return output
    }
}

export const mixObject = (origin: BlendableObject, target: BlendableObject) => {
    const output = { ...origin, ...target }
    const blendValue: { [key: string]: (v: number) => any } = {}

    for (const key in output) {
        if (origin[key] !== undefined && target[key] !== undefined) {
            blendValue[key] = getMixer(origin[key], target[key])
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
): MixComplex => {
    const template = complex.createTransformer(target)
    const originStats = analyseComplexValue(origin)
    const targetStats = analyseComplexValue(target)

    const canInterpolate =
        originStats.numColors === targetStats.numColors &&
        originStats.numNumbers >= targetStats.numNumbers &&
        !originStats.containsCSSVars &&
        !targetStats.containsCSSVars

    if (canInterpolate) {
        return pipe(
            mixArray(originStats.values, targetStats.values),
            template
        ) as MixComplex
    } else {
        warning(
            true,
            `Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`
        )

        return (p: number) => `${p > 0 ? target : origin}`
    }
}
