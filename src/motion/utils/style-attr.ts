import { CSSProperties } from "react"
import { buildStyleProperty } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue } from "../../value"
import { MotionStyle } from "../types"

const isMotionValue = (value: any): value is MotionValue => value instanceof MotionValue

export const buildStyleAttr = (values: MotionValuesMap, styleProp: CSSProperties): CSSProperties => {
    return {
        ...styleProp,
        ...buildStyleProperty(resolveCurrent(values)),
    }
}

export const addMotionStyles = (values: MotionValuesMap, styleProp: MotionStyle = {}): CSSProperties => {
    const style: CSSProperties = {}

    for (const key in styleProp) {
        const thisStyle = styleProp[key]

        if (isMotionValue(thisStyle)) {
            if (!values.has(key)) {
                values.set(key, thisStyle)
            }
        } else {
            style[key] = thisStyle
        }
    }

    return style
}
