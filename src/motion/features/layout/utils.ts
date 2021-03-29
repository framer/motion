import { mix } from "popmotion"
import { Axis, AxisBox2D } from "../../../types/geometry"

export function tweenAxis(target: Axis, prev: Axis, next: Axis, p: number) {
    target.min = mix(prev.min, next.min, p)
    target.max = mix(prev.max, next.max, p)
}

export function calcRelativeOffsetAxis(parent: Axis, child: Axis) {
    return {
        min: child.min - parent.min,
        max: child.max - parent.min,
    }
}

export function calcRelativeOffset(parent: AxisBox2D, child: AxisBox2D) {
    return {
        x: calcRelativeOffsetAxis(parent.x, child.x),
        y: calcRelativeOffsetAxis(parent.y, child.y),
    }
}
