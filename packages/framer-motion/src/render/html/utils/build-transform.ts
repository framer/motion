import { transformPropOrder } from "./transform"
import { MotionProps } from "../../../motion/types"
import { HTMLRenderState } from "../types"
import { getValueAsType } from "../../dom/value-types/get-as-type"
import { numberValueTypes } from "../../dom/value-types/number"

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
}

const numTransforms = transformPropOrder.length

const defaultStringValues = {
    x: "0px",
    y: "0px",
    rotate: "0deg",
    rotateX: "0deg",
    rotateY: "0deg",
    rotateZ: "0deg",
    skew: "0deg",
    skewX: "0deg",
    skewY: "0deg",
}

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    transform: HTMLRenderState["transform"],
    transformTemplate?: MotionProps["transformTemplate"]
) {
    // The transform string we're going to build into.
    let transformString = ""
    let transformIsDefault = false

    /**
     * Loop over all possible transforms in order, adding the ones that
     * are present to the transform string.
     */
    for (let i = 0; i < numTransforms; i++) {
        const key = transformPropOrder[i] as keyof typeof translateAlias
        const value = transform[key]

        if (value === undefined) continue

        let valueIsDefault = true
        if (typeof value === "number") {
            valueIsDefault = value === (key.startsWith("scale") ? 1 : 0)
        } else {
            valueIsDefault =
                value ===
                defaultStringValues[key as keyof typeof defaultStringValues]

            transform[key] = getValueAsType(value, numberValueTypes[key])

            if (!valueIsDefault) {
                const transformName = translateAlias[key] || key

                transformString += `${transformName}(${transform[key]}) `
                transformIsDefault = false
            }
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
