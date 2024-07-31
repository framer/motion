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
    let transformIsDefault = true

    /**
     * Loop over all possible transforms in order, adding the ones that
     * are present to the transform string.
     */
    for (let i = 0; i < numTransforms; i++) {
        const key = transformPropOrder[i] as keyof typeof translateAlias
        const value = transform[key]

        if (value === undefined) continue

        const valueAsNumber =
            typeof value === "number" ? value : parseFloat(value)
        const valueIsDefault =
            valueAsNumber === (key.startsWith("scale") ? 1 : 0)

        // TODO: Would it be better to provide this to a different value
        // vs type changes
        transform[key] = getValueAsType(value, numberValueTypes[key])

        if (!valueIsDefault) {
            const transformName = translateAlias[key] || key

            transformString += `${transformName}(${transform[key]}) `
            transformIsDefault = false
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
