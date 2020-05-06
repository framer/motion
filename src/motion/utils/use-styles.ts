import { CSSProperties } from "react"
import { buildStyleProperty, isTransformProp } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue, motionValue } from "../../value"
import { MotionStyle, MotionProps } from "../types"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { useConstant } from "../../utils/use-constant"

const transformOriginProps = new Set(["originX", "originY", "originZ"])
const isTransformOriginProp = (key: string) => transformOriginProps.has(key)

export const buildStyleAttr = (
    values: MotionValuesMap,
    styleProp: CSSProperties,
    props: MotionProps,
    isStatic?: boolean
): CSSProperties => {
    const motionValueStyles: { [key: string]: any } = resolveCurrent(values)
    const { transformTemplate } = props

    if (transformTemplate) {
        // If `transform` has been manually set as a string, pass that through the template
        // otherwise pass it forward to Stylefire's style property builder
        motionValueStyles.transform = styleProp.transform
            ? transformTemplate({}, styleProp.transform)
            : transformTemplate
    }

    return buildStyleProperty({ ...styleProp, ...motionValueStyles }, !isStatic)
}

const emptyObject = () => ({})

export const useMotionStyles = <V extends {} = {}>(
    values: MotionValuesMap,
    styleProp: MotionStyle = {},
    transformValues?: (values: V) => V
): CSSProperties => {
    const style = {}
    const prevMotionStyles = useConstant(emptyObject)

    // Remove MotionValues that have been removed from the style prop
    for (const key in prevMotionStyles) {
        if (styleProp[key] === undefined) {
            values.delete(key)
            prevMotionStyles[key] = undefined
        }
    }

    for (const key in styleProp) {
        const thisStyle = styleProp[key]

        if (isMotionValue(thisStyle)) {
            // If this is a motion value, add it to our MotionValuesMap
            values.set(key, thisStyle)
        } else if (isTransformProp(key) || isTransformOriginProp(key)) {
            // Or if it's a transform prop, create a motion value (or update an existing one)
            // to ensure Stylefire can reconcile all the transform values together.
            if (!values.has(key)) {
                // If it doesn't exist as a motion value, create it
                values.set(key, motionValue(thisStyle))
            } else {
                // Otherwise only update it if it's changed from a previous render
                if (thisStyle !== prevMotionStyles[key]) {
                    const value = values.get(key) as MotionValue
                    value.set(thisStyle)
                }
            }

            prevMotionStyles[key] = thisStyle
        } else {
            style[key] = thisStyle
        }
    }

    return transformValues ? transformValues(style as any) : style
}
