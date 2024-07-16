import { ResolvedValues } from "../../render/types"
import { Delta, Point } from "../geometry/types"

export function buildProjectionTransform(
    delta: Delta,
    treeScale: Point,
    latestTransform?: ResolvedValues
): string {
    let transform = ""

    /**
     * The translations we use to calculate are always relative to the viewport coordinate space.
     * But when we apply scales, we also scale the coordinate space of an element and its children.
     * For instance if we have a treeScale (the culmination of all parent scales) of 0.5 and we need
     * to move an element 100 pixels, we actually need to move it 200 in within that scaled space.
     */
    const xTranslate = delta.x.translate / treeScale.x
    const yTranslate = delta.y.translate / treeScale.y
    const zTranslate = latestTransform?.z || 0
    if (xTranslate || yTranslate || zTranslate) {
        transform = `translate3d(${xTranslate}px, ${yTranslate}px, ${zTranslate}px) `
    }

    /**
     * Apply scale correction for the tree transform.
     * This will apply scale to the screen-orientated axes.
     */
    if (treeScale.x !== 1 || treeScale.y !== 1) {
        transform += `scale(${1 / treeScale.x}, ${1 / treeScale.y}) `
    }

    if (latestTransform) {
        const { transformPerspective, rotate, rotateX, rotateY, skewX, skewY } =
            latestTransform
        if (transformPerspective)
            transform = `perspective(${transformPerspective}px) ${transform}`
        if (rotate) transform += `rotate(${rotate}deg) `
        if (rotateX) transform += `rotateX(${rotateX}deg) `
        if (rotateY) transform += `rotateY(${rotateY}deg) `
        if (skewX) transform += `skewX(${skewX}deg) `
        if (skewY) transform += `skewY(${skewY}deg) `
    }

    /**
     * Apply scale to match the size of the element to the size we want it.
     * This will apply scale to the element-orientated axes.
     */
    const elementScaleX = delta.x.scale * treeScale.x
    const elementScaleY = delta.y.scale * treeScale.y
    if (elementScaleX !== 1 || elementScaleY !== 1) {
        transform += `scale(${elementScaleX}, ${elementScaleY})`
    }

    return transform || "none"
}

// export function buildProjectionTransform(
//     delta: Delta,
//     treeScale: Point,
//     latestTransform?: ResolvedValues
// ) {
//     const xTranslate = delta.x.translate / treeScale.x
//     const yTranslate = delta.y.translate / treeScale.y
//     const zTranslate = latestTransform?.z || 0
//     const treeScaleX = 1 / treeScale.x
//     const treeScaleY = 1 / treeScale.y
//     const elementScaleX = delta.x.scale * treeScale.x
//     const elementScaleY = delta.y.scale * treeScale.y

//     let perspective = 0
//     let rotate = 0
//     let rotateX = 0
//     let rotateY = 0
//     let rotateZ = 0
//     let skewX = 0
//     let skewY = 0

//     if (latestTransform) {
//         perspective = latestTransform.transformPerspective || 0
//         rotate = latestTransform.rotate || 0
//         rotateX = latestTransform.rotateX || 0
//         rotateY = latestTransform.rotateY || 0
//         rotateZ = latestTransform.rotateZ || 0
//         skewX = latestTransform.skewX || 0
//         skewY = latestTransform.skewY || 0
//     }

//     return `translate3d(${xTranslate}px, ${yTranslate}px, ${zTranslate}px) scale(${treeScaleX}, ${treeScaleY}) rotate(${rotate}deg) scale(${elementScaleX}, ${elementScaleY})`
// }

// export function buildProjectionTransform(
//     delta: Delta,
//     treeScale: Point,
//     latestTransform?: ResolvedValues
// ) {
//     const xTranslate = delta.x.translate / treeScale.x
//     const yTranslate = delta.y.translate / treeScale.y
//     const zTranslate = latestTransform?.z || 0
//     const treeScaleX = 1 / treeScale.x
//     const treeScaleY = 1 / treeScale.y
//     const elementScaleX = delta.x.scale * treeScale.x
//     const elementScaleY = delta.y.scale * treeScale.y

//     let perspective = 0
//     let rotate = 0
//     let rotateX = 0
//     let rotateY = 0
//     let rotateZ = 0
//     let skewX = 0
//     let skewY = 0

//     if (latestTransform) {
//         perspective = latestTransform.transformPerspective || 0
//         rotate = latestTransform.rotate || 0
//         rotateX = latestTransform.rotateX || 0
//         rotateY = latestTransform.rotateY || 0
//         rotateZ = latestTransform.rotateZ || 0
//         skewX = latestTransform.skewX || 0
//         skewY = latestTransform.skewY || 0
//     }

//     return (
//         (perspective ? "perspective(${perspective}px) " : "") +
//         (xTranslate || yTranslate || zTranslate
//             ? "translate3d(" +
//               xTranslate +
//               "px, " +
//               yTranslate +
//               "px, " +
//               zTranslate +
//               "px) "
//             : "") +
//         (treeScaleX !== 1 || treeScaleY !== 1
//             ? "scale(" + treeScaleX + ", " + treeScaleY + ") "
//             : "") +
//         (rotate || rotateX || rotateY || rotateZ || skewX || skewY
//             ? "rotate(" +
//               rotate +
//               "deg) rotateX(" +
//               rotateX +
//               "deg) rotateY(" +
//               rotateY +
//               "deg) rotateZ(" +
//               rotateZ +
//               "deg) skew(" +
//               skewX +
//               "deg, " +
//               skewY +
//               "deg) "
//             : "") +
//         (elementScaleX !== 1 || elementScaleY !== 1
//             ? "scale(" + elementScaleX + ", " + elementScaleY + ") "
//             : "")
//     )
// }
