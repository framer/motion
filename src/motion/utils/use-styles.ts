import { useRef, CSSProperties } from "react"
import { buildStyleProperty, isTransformProp } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue, motionValue } from "../../value"
import { MotionStyle } from "../types"

const transformOriginProps = new Set(["originX", "originY"])
const isTransformOriginProp = (key: string) => transformOriginProps.has(key)

const isMotionValue = (value: any): value is MotionValue => {
    return value instanceof MotionValue
}

export const buildStyleAttr = (
    values: MotionValuesMap,
    styleProp: CSSProperties
): CSSProperties => {
    return {
        ...styleProp,
        ...buildStyleProperty(
            {
                transform: values.getTransformTemplate(),
                ...resolveCurrent(values),
            },
            // Disable GPU acceleration for React-set styles. This shouldn't
            // cause any issues but should improve page load performance.
            // Something to keep an eye out for is potentially stuff like animating
            // scale to 2, there's a potential that on re-render blurry content will become
            // sharp, issues of that nature.
            false
        ),
    }
}

export const useMotionStyles = (
    values: MotionValuesMap,
    styleProp: MotionStyle = {}
): CSSProperties => {
    const style = useRef<CSSProperties>({}).current
    const prevMotionStyles = useRef({}).current

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
            // Otherwise this is a normal style, add it as normal
            style[key] = thisStyle
        }
    }

    return style
}
