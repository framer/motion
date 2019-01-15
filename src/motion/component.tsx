import * as React from "react"
import { memo, forwardRef, createElement, Ref, ComponentType } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { buildStyleAttr, addMotionStyles } from "./utils/style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { useAnimationSubscription } from "./utils/use-animation-subscription"
import { usePoses } from "./utils/use-poses"
import { MotionContext, useMotionContext } from "./utils/MotionContext"
import { MotionProps } from "./types"
import { useGestures } from "../gestures"
import { useDraggable } from "../behaviours"

export const createMotionComponent = <P extends {}>(Component: string | ComponentType<P>) => {
    const MotionComponent = (p: P & MotionProps, externalRef?: Ref<Element>) => {
        const {
            animate,
            pose = "default",
            style: motionStyle,
            onPoseComplete,
            inherit = false,
            initialPose,
            dragEnabled,
            dragLocksDirection,
            dragPropagation,
            ...props
        } = p as MotionProps
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(ref)
        const style = addMotionStyles(values, motionStyle)
        const controls = useAnimationControls(values, inherit, props)
        const context = useMotionContext(controls, inherit, initialPose || pose)

        useAnimationSubscription(animate, controls)
        usePoses(animate, inherit, controls, onPoseComplete, pose, initialPose)

        useGestures(props, ref)
        useDraggable({ dragEnabled, dragLocksDirection, dragPropagation }, ref, values)

        return (
            <MotionContext.Provider value={context}>
                {createElement<any>(Component, {
                    ...props,
                    ref,
                    style: buildStyleAttr(values, style),
                })}
            </MotionContext.Provider>
        )
    }

    return memo(forwardRef(MotionComponent))
}
