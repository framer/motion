import { mix } from "popmotion"
import { Axis } from "../../../types/geometry"

export function tweenAxis(target: Axis, prev: Axis, next: Axis, p: number) {
    target.min = mix(prev.min, next.min, p)
    target.max = mix(prev.max, next.max, p)
}
