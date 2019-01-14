import { RefObject } from "react"
import { MotionValueMap, Pose } from "../motion/types"
import { motionValue } from "../motion-value"
import styler from "stylefire"
import { invariant } from "hey-listen"

const poseSpecialProps = new Set(["transition", "transitionEnd"])

export const createValuesFromPose = (values: MotionValueMap, { transition, transitionEnd, ...pose }: Pose) => {
    const valuesToAdd = { ...pose, ...transitionEnd }
    Object.keys(valuesToAdd).forEach(valueKey => {
        if (!values.has(valueKey)) {
            values.set(valueKey, motionValue(valuesToAdd[valueKey]))
        }
    })
}

export const bindValuesToRef = (values: MotionValueMap, ref: RefObject<Element>) => {
    invariant(
        ref.current !== null,
        "No DOM reference found. Ensure custom components use `forwardRef` to forward the `ref` property to the host DOM component."
    )

    if (!ref.current) return

    const domStyler = styler(ref.current)

    values.forEach((value, key) => {
        if (!value.hasOnRender()) {
            value.setOnRender((v: any) => domStyler.set(key, v))
        }
    })
}

export const checkForNewValues = (pose: Pose, values: MotionValueMap, ref: RefObject<Element>) => {
    const newValueKeys = Object.keys(pose).filter(key => !poseSpecialProps.has(key) && !values.has(key))

    if (newValueKeys.length) {
        createValuesFromPose(values, pose)
        bindValuesToRef(values, ref)
    }
}
