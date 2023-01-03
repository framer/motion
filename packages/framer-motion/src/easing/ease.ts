import { mirrorEasing } from "./modifiers/mirror"
import { reverseEasing } from "./modifiers/reverse"

export const easeIn = (p: number) => p * p
export const easeOut = reverseEasing(easeIn)
export const easeInOut = mirrorEasing(easeIn)
