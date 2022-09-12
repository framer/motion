import * as React from "react"
import { useContext, useLayoutEffect } from "react"
import { MotionConfigContext } from "../../../context/MotionConfigContext"
import { useConstant } from "../../../utils/use-constant"
import { AnimatedProps } from "../types"
import { AnimationState } from "./AnimationState"
import { AnimationStateContext } from "./context"

export function useAnimationState(
    ref: React.RefObject<HTMLElement>,
    props: AnimatedProps
) {
    const { isStatic } = useContext(MotionConfigContext)
    const parentState = useContext(AnimationStateContext)
    const state = useConstant(() => new AnimationState(props, parentState))

    if (!isStatic) {
        useLayoutEffect(() => {
            state.mount(ref.current!)

            return () => state.unmount()
        }, [])

        useLayoutEffect(() => {
            state.updateProps(props)
            state.update()
        })
    }

    return state
}
