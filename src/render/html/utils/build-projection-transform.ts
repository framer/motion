import { BoxDelta, Point2D } from "../../../types/geometry"
import { ResolvedValues } from "../../types"
import { LayoutState, zeroLayout } from "../../utils/state"

export type BuildProjectionTransform = (
    box: BoxDelta,
    treeScale: Point2D,
    transform?: ResolvedValues
) => string
export type BuildProjectionTransformOrigin = (layout: LayoutState) => string

/**
 * Build a transform style that takes a calculated delta between the element's current
 * space on screen and projects it into the desired space.
 */
export function buildLayoutProjectionTransform(
    { x, y }: BoxDelta,
    treeScale: Point2D,
    latestTransform?: ResolvedValues
): string {
    /**
     * The translations we use to calculate are always relative to the viewport coordinate space.
     * But when we apply scales, we also scale the coordinate space of an element and its children.
     * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
     * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
     */
    const xTranslate = x.translate / treeScale.x
    const yTranslate = y.translate / treeScale.y

    let transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0) `

    if (latestTransform) {
        const { rotate, rotateX, rotateY } = latestTransform
        if (rotate) transform += `rotate(${rotate}) `
        if (rotateX) transform += `rotateX(${rotateX}) `
        if (rotateY) transform += `rotateY(${rotateY}) `
    }

    transform += `scale(${x.scale}, ${y.scale})`

    return !latestTransform && transform === identityProjection ? "" : transform
}

/**
 * Take the calculated delta origin and apply it as a transform string.
 */
export function buildLayoutProjectionTransformOrigin({
    deltaFinal,
}: LayoutState) {
    return `${deltaFinal.x.origin * 100}% ${deltaFinal.y.origin * 100}% 0`
}

export const identityProjection = buildLayoutProjectionTransform(
    zeroLayout.delta,
    zeroLayout.treeScale,
    { x: 1, y: 1 }
)
