import * as React from "react"
import { MutableRefObject, useContext, useEffect, useRef } from "react"
import { PresenceContext } from "../../context/PresenceContext"
import { MotionProps } from "../../motion/types"
import { useVisualElementContext } from "../../context/MotionContext"
import { CreateVisualElement, VisualElement } from "../../render/types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualState } from "./use-visual-state"
import { LazyContext } from "../../context/LazyContext"
import { MotionConfigProps } from "../../components/MotionConfig"
import { useReducedMotionConfig } from "../../utils/use-reduced-motion"

export function useVisualElement<Instance, RenderState>(
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>,
    visualState: VisualState<Instance, RenderState>,
    props: MotionProps & MotionConfigProps,
    createVisualElement?: CreateVisualElement<Instance>
): VisualElement<Instance> | undefined {
    const lazyContext = useContext(LazyContext)
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)
    const shouldReduceMotion = useReducedMotionConfig()

    const visualElementRef: MutableRefObject<VisualElement | undefined> =
        useRef(undefined)

    /**
     * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
     */
    if (!createVisualElement) createVisualElement = lazyContext.renderer

    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState,
            parent,
            props,
            presenceId: presenceContext ? presenceContext.id : undefined,
            blockInitialAnimation: presenceContext
                ? presenceContext.initial === false
                : false,
            shouldReduceMotion,
        })
    }

    const visualElement = visualElementRef.current
    useIsomorphicLayoutEffect(() => {
        visualElement && visualElement.syncRender()
    })

    useEffect(() => {
        if (visualElement && visualElement.animationState) {
            visualElement.animationState.animateChanges()
        }
    })

    useIsomorphicLayoutEffect(
        () => () => visualElement && visualElement.notifyUnmount(),
        []
    )

    return visualElement
}
