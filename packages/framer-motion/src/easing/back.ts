import { mirrorEasing } from "./modifiers/mirror"
import { reverseEasing } from "./modifiers/reverse"
import { EasingFunction } from "./types"

export const createBackIn =
    (power: number = 1.525): EasingFunction =>
    (p) =>
        p * p * ((power + 1) * p - power)

export const backIn = createBackIn()
export const backOut = reverseEasing(backIn)
export const backInOut = mirrorEasing(backIn)
