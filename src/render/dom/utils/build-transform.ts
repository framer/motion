import { TransformTemplate } from "../../../motion/types"
import { ResolvedValues } from "../../VisualElement/types"
import { sortTransformProps } from "./transform"
import { Point2D, BoxDelta } from "../../../types/geometry"
import { TransformOrigin } from "../types"
import { delta } from "../../../utils/geometry"

const translateAlias: { [key: string]: string } = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
}

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    transform: ResolvedValues,
    transformKeys: string[],
    transformTemplate: TransformTemplate | undefined,
    transformIsDefault: boolean,
    enableHardwareAcceleration = true,
    allowTransformNone = true
) {
    // The transform string we're going to build into.
    let transformString = ""

    // Transform keys into their default order - this will determine the output order.
    transformKeys.sort(sortTransformProps)

    // Track whether the defined transform has a defined z so we don't add a
    // second to enable hardware acceleration
    let transformHasZ = false

    // Loop over each transform and build them into transformString
    const numTransformKeys = transformKeys.length
    for (let i = 0; i < numTransformKeys; i++) {
        const key = transformKeys[i]
        transformString += `${translateAlias[key] || key}(${transform[key]}) `

        if (key === "z") transformHasZ = true
    }

    if (!transformHasZ && enableHardwareAcceleration) {
        transformString += "translateZ(0)"
    } else {
        transformString = transformString.trim()
    }

    // If we have a custom `transform` template, pass our transform values and
    // generated transformString to that before returning
    if (transformTemplate) {
        transformString = transformTemplate(
            transform,
            transformIsDefault ? "" : transformString
        )
    } else if (allowTransformNone && transformIsDefault) {
        transformString = "none"
    }

    return transformString
}

/**
 * Build a transformOrigin style. Uses the same defaults as the browser for
 * undefined origins.
 */
export function buildTransformOrigin({
    originX = "50%",
    originY = "50%",
    originZ = 0,
}: TransformOrigin) {
    return `${originX} ${originY} ${originZ}`
}

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

export const identityProjection = buildLayoutProjectionTransform(delta(), {
    x: 1,
    y: 1,
})

/**
 * Take the calculated delta origin and apply it as a transform string.
 */
export function buildLayoutProjectionTransformOrigin({ x, y }: BoxDelta) {
    return `${x.origin * 100}% ${y.origin * 100}% 0`
}
