import { px } from "style-value-types"
import { ResolvedValues } from "../../types"

const progressToPixels = (progress: number, length: number) =>
    (px as any).transform(progress * length)

const dashKeys = {
    offset: "stroke-dashoffset",
    array: "stroke-dasharray",
}

const camelKeys = {
    offset: "strokeDashoffset",
    array: "strokeDasharray",
}

export function buildSVGPath(
    attrs: ResolvedValues,
    totalLength: number,
    length: number,
    spacing = 1,
    offset = 0,
    useDashCase: boolean = true
): void {
    const keys = useDashCase ? dashKeys : camelKeys
    attrs[keys.offset] = progressToPixels(-offset, totalLength)
    const pathLength = progressToPixels(length, totalLength)
    const pathSpacing = progressToPixels(spacing, totalLength)
    attrs[keys.array] = `${pathLength} ${pathSpacing}`
}
