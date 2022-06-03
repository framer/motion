import { ResolvedValues } from "../../render/types"
import { Delta, Point } from "../geometry/types"

export const identityProjection = "translate3d(0px, 0px, 0) scale(1, 1)"

export function buildProjectionTransform(
    delta: Delta,
    treeScale: Point,
    latestTransform?: ResolvedValues
): string {
    /**
     * The translations we use to calculate are always relative to the viewport coordinate space.
     * But when we apply scales, we also scale the coordinate space of an element and its children.
     * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
     * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
     */
    const xTranslate = delta.x.translate / treeScale.x
    const yTranslate = delta.y.translate / treeScale.y
    let transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0) `

    /**
     * Scale must come before rotate otherwise the scale correction will be rotated,
     * compounding the distortion.
     */
    transform += `scale(${delta.x.scale}, ${delta.y.scale}) `

    if (latestTransform) {
        const { rotate, rotateX, rotateY } = latestTransform
        if (rotate) transform += `rotate(${rotate}deg) `
        if (rotateX) transform += `rotateX(${rotateX}deg) `
        if (rotateY) transform += `rotateY(${rotateY}deg) `
    }

    return transform === identityProjection ? "none" : transform.trim()
}
