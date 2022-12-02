import { RGBA } from "../types"
import { rgba } from "./rgba"
import { isColorString } from "./utils"

function parseHex(v: string): RGBA {
    let r = ""
    let g = ""
    let b = ""
    let a = ""

    // If we have 6 characters, ie #FF0000
    if (v.length > 5) {
        r = v.substring(1, 2)
        g = v.substring(3, 4)
        b = v.substring(5, 6)
        a = v.substring(7, 8)

        // Or we have 3 characters, ie #F00
    } else {
        r = v.substring(1, 1)
        g = v.substring(2, 2)
        b = v.substring(3, 3)
        a = v.substring(4, 4)
        r += r
        g += g
        b += b
        a += a
    }

    return {
        red: parseInt(r, 16),
        green: parseInt(g, 16),
        blue: parseInt(b, 16),
        alpha: a ? parseInt(a, 16) / 255 : 1,
    }
}

export const hex = {
    test: isColorString("#"),
    parse: parseHex,
    transform: rgba.transform,
}
