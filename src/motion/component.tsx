import * as React from "react"
import { memo, forwardRef, createElement, Ref } from "react"
import { useExternalRef } from "../hooks/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { useStyleAttr } from "./utils/use-style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { usePoses } from "./utils/use-poses"
import { MotionContext } from "./utils/MotionContext"

export const createMotionComponent = <P extends {}>(Component: string) => {
    const MotionComponent = (
        { animator, pose, inheritPose = false, style, onPoseComplete, ...props }: P & MotionProps,
        externalRef?: Ref<Element>
    ) => {
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(ref)
        const controls = useAnimationControls(animator, values, inheritPose, props)
        usePoses(controls, pose, inheritPose, onPoseComplete)

        return (
            <MotionContext.Provider value={{ pose, controls }}>
                {createElement<any>(Component, {
                    ...props,
                    ref,
                    style: useStyleAttr(values, style),
                })}
            </MotionContext.Provider>
        )
    }

    return memo(forwardRef(MotionComponent))
}
