import { color, complex, RGBA, HSLA } from "style-value-types"
import { mix } from "./mix"
import { mixColor } from "./mix-color"
import { pipe } from "./pipe"
import { warning } from "hey-listen"

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

/**
 * TODO: Combine with function within complex when style-value-types moved inside Framer Motion
 */
function analyse(value: string | number) {
    const parsed = complex.parse(value)
    const numValues = parsed.length
    let numNumbers = 0
    let numColors = 0

    for (let i = 0; i < numValues; i++) {
        // Parsed complex values return with colors first, so if we've seen any number
        // we're already past that part of the array and don't need to continue running typeof
        if (numNumbers || typeof parsed[i] === "number") {
            numNumbers++
        } else {
            numColors++
        }
    }

    return { parsed, numNumbers, numColors }
}

export const mixComplex = (
    origin: string | number,
    target: string | number
): MixComplex => {
    const template = complex.createTransformer(target)
    const originStats = analyse(origin)
    const targetStats = analyse(target)

    const canInterpolate =
        originStats.numColors === targetStats.numColors &&
        originStats.numNumbers >= targetStats.numNumbers

    if (canInterpolate) {
        return pipe(
            mixArray(originStats.parsed, targetStats.parsed),
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
