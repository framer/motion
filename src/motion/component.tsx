import * as React from "react"
import { ComponentType } from "react"
import { memo, forwardRef, createElement, Ref } from "react"
import { useExternalRef } from "./utils/use-external-ref"
import { useMotionValues } from "./utils/use-motion-values"
import { useStyleAttr } from "./utils/use-style-attr"
import { useAnimationControls } from "./utils/use-animation-controls"
import { useAnimationSubscription } from "./utils/use-animation-subscription"
import { usePoses } from "./utils/use-poses"
import { MotionContext } from "./utils/MotionContext"
import { ComponentFactory, MotionProps } from "./types"

export const createMotionComponent: ComponentFactory = <P extends {}>(Component: ComponentType<P>) => {
    const MotionComponent = (
        { animation, pose, style, onPoseComplete, ...props }: P & MotionProps,
        externalRef?: Ref<Element>
    ) => {
        const ref = useExternalRef(externalRef)
        const values = useMotionValues(ref)
        const controls = useAnimationControls(values, props)

        useAnimationSubscription(animation, controls)
        usePoses(animation, pose, controls, onPoseComplete)

        return (
            <MotionContext.Provider value={{ pose }}>
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
