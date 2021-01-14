import { px } from "style-value-types"
import { ResolvedValues } from "../../VisualElement/types"

// Convert a progress 0-1 to a pixels value based on the provided length
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

/**
 * Build SVG path properties. Uses the path's measured length to convert
 * our custom pathLength, pathSpacing and pathOffset into stroke-dashoffset
 * and stroke-dasharray attributes.
 *
 * This function is mutative to reduce per-frame GC.
 */
export function buildSVGPath(
    attrs: ResolvedValues,
    totalLength: number,
    length: number,
    spacing = 1,
    offset = 0,
    useDashCase: boolean = true
): void {
    // We use dash case when setting attributes directly to the DOM node and camel case
    // when defining props on a React component.
    const keys = useDashCase ? dashKeys : camelKeys

    // Build the dash offset
    attrs[keys.offset] = progressToPixels(-offset, totalLength)

    // Build the dash array
    const pathLength = progressToPixels(length, totalLength)
    const pathSpacing = progressToPixels(spacing, totalLength)
    attrs[keys.array] = `${pathLength} ${pathSpacing}`
}
