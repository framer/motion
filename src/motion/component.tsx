import * as React from "react"
import { memo, forwardRef, createElement, Ref, ComponentType } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { useStyleAttr } from "./utils/use-style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { useAnimationSubscription } from "./utils/use-animation-subscription"
import { usePoses } from "./utils/use-poses"
import { MotionContext, useMotionContext } from "./utils/MotionContext"
import { ComponentFactory, MotionProps } from "./types"

export const createMotionComponent: ComponentFactory = <P extends {}>(Component: ComponentType<P>) => {
    const MotionComponent = (
        { animation, pose = "default", style, onPoseComplete, inherit = false, ...props }: P & MotionProps,
        externalRef?: Ref<Element>
    ) => {
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
