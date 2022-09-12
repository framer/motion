import * as React from "react"
import { createElement, useRef } from "react"
import { MotionContext } from "../../context/MotionContext"
import { useCreateMotionContext } from "../../context/MotionContext/create"
import { AnimationStateContext } from "./state/context"
import { useAnimationState } from "./state/use-animation-state"
import { AnimatedProps } from "./types"
import { useStyle } from "./use-style"

export function Animated({
    as = "div",
    initial,
    animate,
    exit,
    variants,
    transition,
    onTap,
    onTapCancel,
    onTapStart,
    whileTap,
    onHoverStart,
    onHoverEnd,
    whileHover,
    whileInView,
    viewport,
    onViewportEnter,
    onViewportLeave,
    ...elementProps
}: AnimatedProps) {
    const ref = useRef<HTMLElement>(null)
    const context = useCreateMotionContext({ initial, animate })

    const props = {
        initial,
        animate,
        exit,
        variants,
        transition,
        onTap,
        onTapCancel,
        onTapStart,
        whileTap,
        onHoverStart,
        onHoverEnd,
        whileHover,
        whileInView,
        viewport,
        onViewportEnter,
        onViewportLeave,
    }

    const state = useAnimationState(ref, props)
    const style = useStyle(state, (elementProps as any).style)

    return (
        <AnimationStateContext.Provider value={state}>
            <MotionContext.Provider value={context}>
                {createElement(as, { ...elementProps, ref, style } as any)}
            </MotionContext.Provider>
        </AnimationStateContext.Provider>
    )
}
