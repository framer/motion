import { useMemo, CSSProperties } from "react"
import { buildStyleProperty } from "stylefire"
import { resolveCurrent } from "../../value/utils/resolve-values"
import { MotionValuesMap } from "./use-motion-values"
import { MotionValue } from "../../value"

const isMotionValue = (value: any): value is MotionValue => value instanceof MotionValue

export const useStyleAttr = (values: MotionValuesMap, styleProp = {}): CSSProperties => {
    const style: CSSProperties = {}

    Object.keys(styleProp).forEach(key => {
        const thisStyle = styleProp[key]

        if (isMotionValue(thisStyle)) {
            if (values.get(key) !== thisStyle) {
                values.set(key, thisStyle)
            }
        } else {
            style[key] = thisStyle
        }
    })

    return useMemo(
        () => ({
            ...style,
            ...buildStyleProperty(resolveCurrent(values)),
        }),
        []
    )
}
