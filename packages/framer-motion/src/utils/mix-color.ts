import { mix } from "./mix"
import { invariant } from "hey-listen"
import { hslaToRgba } from "./hsla-to-rgba"
import { hex } from "../value/types/color/hex"
import { rgba } from "../value/types/color/rgba"
import { hsla } from "../value/types/color/hsla"
import { Color, HSLA, RGBA } from "../value/types/types"

// Linear color space blending
// Explained https://www.youtube.com/watch?v=LKnqECcg6Gw
// Demonstrated http://codepen.io/osublake/pen/xGVVaN
export const mixLinearColor = (from: number, to: number, v: number) => {
    const fromExpo = from * from
    return Math.sqrt(Math.max(0, v * (to * to - fromExpo) + fromExpo))
}

const colorTypes = [hex, rgba, hsla]
const getColorType = (v: Color | string) =>
    colorTypes.find((type) => type.test(v))

function asRGBA(color: Color | string) {
    const type = getColorType(color)

    invariant(
        Boolean(type),
        `'${color}' is not an animatable color. Use the equivalent color code instead.`
    )

    let model = type!.parse(color)

    if (type === hsla) {
        model = hslaToRgba(model as HSLA)
    }

    return model as RGBA
}

export const mixColor = (from: Color | string, to: Color | string) => {
    const fromRGBA = asRGBA(from)
    const toRGBA = asRGBA(to)

    const blended = { ...fromRGBA }

    return (v: number) => {
        blended.red = mixLinearColor(fromRGBA.red, toRGBA.red, v)
        blended.green = mixLinearColor(fromRGBA.green, toRGBA.green, v)
        blended.blue = mixLinearColor(fromRGBA.blue, toRGBA.blue, v)
        blended.alpha = mix(fromRGBA.alpha, toRGBA.alpha, v)
        return rgba.transform!(blended)
    }
}
