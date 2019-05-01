import { useRef, CSSProperties } from "react"
import { buildStyleProperty, isTransformProp } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue, motionValue } from "../../value"
import { MotionStyle, CustomStyles } from "../types"

const transformOriginProps = new Set(["originX", "originY"])
const isTransformOriginProp = (key: string) => transformOriginProps.has(key)

const isMotionValue = (value: any): value is MotionValue => {
    return value instanceof MotionValue
}

export const buildStyleAttr = (
    values: MotionValuesMap,
    styleProp: CSSProperties,
    isStatic?: boolean
): CSSProperties => {
    const motionValueStyles: { [key: string]: any } = resolveCurrent(values)
    const transformTemplate = values.getTransformTemplate()

    if (transformTemplate) {
        // If `transform` has been manually set as a string, pass that through the template
        // otherwise pass it forward to Stylefire's style property builder
        motionValueStyles.transform = styleProp.transform
            ? transformTemplate({}, styleProp.transform)
            : transformTemplate
    }

    return {
        ...styleProp,
        ...buildStyleProperty(motionValueStyles, !isStatic),
    }
}

export const useMotionStyles = <V extends {} = {}>(
    values: MotionValuesMap,
    styleProp: MotionStyle = {},
    transformValues?: (values: V) => V
): CSSProperties => {
    const style = useRef<CSSProperties & CustomStyles>({}).current
    const prevMotionStyles = useRef({}).current
    const currentStyleKeys = new Set(Object.keys(style))

    for (const key in styleProp) {
        currentStyleKeys.delete(key)
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

    currentStyleKeys.forEach(key => delete style[key])

    return transformValues ? transformValues(style as any) : style
}
