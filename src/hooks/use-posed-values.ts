import { MotionValue } from "../motion-value"
import { resolvePoses } from "../utils/pose-resolvers"
import { PoseConfig, MotionProps, MotionValueMap } from "../motion/types"
import { useRef, useEffect, RefObject } from "react"
import { createValuesFromPose, bindValuesToRef } from "../utils/create-value"

export const usePosedValues = (
    config: PoseConfig,
    { onPoseComplete, ...props }: MotionProps,
    ref: RefObject<Element>
): [MotionValueMap, Partial<MotionProps>] => {
    const values: MotionValueMap = useRef(new Map()).current
    const returnedProps = {}

    // In this function we want to find the right approach to ensure
    // we successfully remove MotionValues from the returned props
    // in a performant way over subsequent renders.

    // 1. Add provided motion values via props to value map
    Object.keys(props).forEach(key => {
        const prop = props[key]

        if (prop instanceof MotionValue) {
            values.set(key, prop)
        } else if (key !== "pose") {
            returnedProps[key] = prop
        }
    })

    // 2. Create values from poses
    const { pose = "default" } = props
    const initialPoses = resolvePoses(pose)

    initialPoses.forEach(poseKey => {
        const poseDef = config[poseKey]
        if (!poseDef) return

        const currentPose = typeof poseDef === "function" ? poseDef(props, {}, {}) : poseDef

        createValuesFromPose(values, currentPose)
    })

    // 3. Bind stylers when ref is ready
    useEffect(() => {
        bindValuesToRef(values, ref)

        return () => values.forEach(value => value.destroy())
    }, [])

    return [values, returnedProps]
}
