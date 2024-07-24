import { transformPropOrder } from "./transform"
import { MotionProps } from "../../../motion/types"
import { HTMLRenderState } from "../types"

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
}

const numTransforms = transformPropOrder.length

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    transform: HTMLRenderState["transform"],
    transformIsDefault: boolean,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    // The transform string we're going to build into.
    let transformString = ""

    /**
     * Loop over all possible transforms in order, adding the ones that
     * are present to the transform string.
     */
    for (let i = 0; i < numTransforms; i++) {
        const key = transformPropOrder[i] as keyof typeof translateAlias
        if (transform[key] !== undefined) {
            const transformName = translateAlias[key] || key
            transformString += `${transformName}(${transform[key]}) `
        }
    }

    transformString = transformString.trim()

    // If we have a custom `transform` template, pass our transform values and
    // generated transformString to that before returning
    if (transformTemplate) {
        transformString = transformTemplate(
            transform,
            transformIsDefault ? "" : transformString
        )
    } else if (transformIsDefault) {
        transformString = "none"
    }

    return transformString
}
