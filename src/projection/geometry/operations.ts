import { Axis } from "./types"

export function translateAxis(axis: Axis, distance: number) {
    axis.min = axis.min + distance
    axis.max = axis.max + distance
}
