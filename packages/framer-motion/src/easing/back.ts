import { cubicBezier } from "./cubic-bezier"
import { mirrorEasing } from "./modifiers/mirror"
import { reverseEasing } from "./modifiers/reverse"

export const backOut = cubicBezier(0.33, 1.53, 0.69, 0.99)
export const backIn = reverseEasing(backOut)
export const backInOut = mirrorEasing(backIn)
