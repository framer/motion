import { wrap } from "../../utils/wrap"
import { isEasingArray } from "./is-easing-array"

export function getEasingForSegment<T>(easing: T | T[], i: number) {
    return isEasingArray(easing) ? easing[wrap(0, easing.length, i)] : easing
}
