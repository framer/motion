import * as React from "react"
import { memo, forwardRef, createElement, Ref, ComponentType } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { useStyleAttr } from "./utils/use-style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { useAnimationSubscription } from "./utils/use-animation-subscription"
import { usePoses } from "./utils/use-poses"
import { MotionContext, useMotionContext } from "./utils/MotionContext"
import { MotionProps } from "./types"

export const createMotionComponent = <P extends {}>(Component: string | ComponentType<P>) => {
    const MotionComponent = (p: P & MotionProps, externalRef?: Ref<Element>) => {
        const { animation, pose = "default", style, onPoseComplete, inherit = false, ...props } = p as MotionProps
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(ref)
        const controls = useAnimationControls(values, inherit, props)
        const context = useMotionContext(controls, inherit, pose)

        useAnimationSubscription(animation, controls)
        usePoses(animation, inherit, controls, onPoseComplete, pose)

        // const handlers = useGestures(props, ref, controls/values)

        return (
            <MotionContext.Provider value={context}>
                {createElement<any>(Component, {
                    ...props,
                    ref,
                    // ...handlers,
                    style: useStyleAttr(values, style),
                })}
            </MotionContext.Provider>
        )
    }

    return memo(forwardRef(MotionComponent))
}
