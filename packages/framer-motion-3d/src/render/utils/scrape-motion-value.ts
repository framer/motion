import { isMotionValue } from "framer-motion"
import type { ScrapeMotionValuesFromProps, MotionValue } from "framer-motion"
import { ThreeMotionProps } from "../../types"

const axes = ["x", "y", "z"]

const valueMap = {
    "position-x": "x",
    "position-y": "y",
    "position-z": "z",
    "rotation-x": "rotateX",
    "rotation-y": "rotateY",
    "rotation-z": "rotateZ",
    "scale-x": "scaleX",
    "scale-y": "scaleY",
    "scale-z": "scaleZ",
}

export const scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps = (
    props: ThreeMotionProps,
    prevProps: ThreeMotionProps
) => {
    const motionValues: { [key: string]: MotionValue } = {}

    let key: keyof typeof props
    for (key in props) {
        const prop = props[key]

        if (isMotionValue(prop) || isMotionValue(prevProps[key])) {
            const valueKey = valueMap[key as keyof typeof valueMap] || key
            motionValues[valueKey] = prop as any
        } else if (Array.isArray(prop)) {
            for (let i = 0; i < prop.length; i++) {
                const value = prop[i]
                const prevValue = prevProps[key]
                const prevArrayValue = Array.isArray(prevValue)
                    ? prevValue[i]
                    : undefined
                if (
                    isMotionValue(value) ||
                    (prevArrayValue !== undefined &&
                        isMotionValue(prevArrayValue))
                ) {
                    const name =
                        valueMap[`${key}-${axes[i]}` as keyof typeof valueMap]
                    motionValues[name] = value as any
                }
            }
        }
    }

    return motionValues
}
