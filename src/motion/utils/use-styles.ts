import { useRef, CSSProperties } from "react"
import { buildStyleProperty, isTransformProp } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue, motionValue } from "../../value"
import { MotionStyle, CustomStyles } from "../types"
import { transformCustomValues } from "./transform-custom-values"
import { resolveValue } from "../../utils/resolve-value"

const transformOriginProps = new Set(["originX", "originY"])
const isTransformOriginProp = (key: string) => transformOriginProps.has(key)

const isMotionValue = (value: any): value is MotionValue => {
    return value instanceof MotionValue
}

export const buildStyleAttr = (
    values: MotionValuesMap,
    styleProp: CSSProperties,
    isStatic: boolean
): CSSProperties => {
    return {
        ...styleProp,
        ...buildStyleProperty(
            {
                transform: values.getTransformTemplate(),
                ...resolveCurrent(values),
            },
            !isStatic
        ),
    }
}

export const useMotionStyles = (
    values: MotionValuesMap,
    styleProp: MotionStyle = {}
): CSSProperties => {
    const style = useRef<CSSProperties & CustomStyles>({}).current
    const prevMotionStyles = useRef({}).current

    for (const key in styleProp) {
        const thisStyle = styleProp[key]

        if (isMotionValue(thisStyle)) {
            // If this is a motion value, add it to our MotionValuesMap
            values.set(key, thisStyle)
        } else if (isTransformProp(key) || isTransformOriginProp(key)) {
            const resolvedStyle = resolveValue(thisStyle)

            // Or if it's a transform prop, create a motion value (or update an existing one)
            // to ensure Stylefire can reconcile all the transform values together.
            if (!values.has(key)) {
                // If it doesn't exist as a motion value, create it
                values.set(key, motionValue(resolvedStyle))
            } else {
                // Otherwise only update it if it's changed from a previous render
                if (resolvedStyle !== prevMotionStyles[key]) {
                    const value = values.get(key) as MotionValue
                    value.set(resolvedStyle)
                }
            }

            prevMotionStyles[key] = resolvedStyle
        } else {
            const resolvedStyle = resolveValue(thisStyle)
            // Otherwise this is a normal style, add it as normal
            style[key] = resolvedStyle
        }
    }

    return transformCustomValues(style)
}
