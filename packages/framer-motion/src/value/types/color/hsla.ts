import { alpha as alphaType } from "../numbers"
import { percent } from "../numbers/units"
import { HSLA } from "../types"
import { sanitize } from "../utils"
import { isColorString, splitColor } from "./utils"

export const hsla = {
    test: isColorString("hsl", "hue"),
    parse: splitColor("hue", "saturation", "lightness"),
    transform: ({ hue, saturation, lightness, alpha = 1 }: HSLA) => {
        return (
            "hsla(" +
            Math.round(hue) +
            ", " +
            percent.transform(sanitize(saturation)) +
            ", " +
            percent.transform(sanitize(lightness)) +
            ", " +
            sanitize(alphaType.transform(alpha)) +
            ")"
        )
    },
}
