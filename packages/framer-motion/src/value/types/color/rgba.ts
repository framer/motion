import { clamp } from "../../../utils/clamp"
import { alpha as alphaType, number } from "../numbers"
import { RGBA } from "../types"
import { sanitize } from "../utils"
import { isColorString, splitColor } from "./utils"

const clampRgbUnit = (v: number) => clamp(0, 255, v)
export const rgbUnit = {
    ...number,
    transform: (v: number) => Math.round(clampRgbUnit(v)),
}

export const rgba = {
    test: isColorString("rgb", "red"),
    parse: splitColor<RGBA>("red", "green", "blue"),
    transform: ({ red, green, blue, alpha = 1 }: RGBA) =>
        "rgba(" +
        rgbUnit.transform(red) +
        ", " +
        rgbUnit.transform(green) +
        ", " +
        rgbUnit.transform(blue) +
        ", " +
        sanitize(alphaType.transform(alpha)) +
        ")",
}
