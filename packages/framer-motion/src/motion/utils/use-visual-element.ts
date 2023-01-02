import * as React from "react"
import { useContext, useEffect, useRef } from "react"
import { PresenceContext } from "../../context/PresenceContext"
import { MotionProps } from "../../motion/types"
import { useVisualElementContext } from "../../context/MotionContext"
import { CreateVisualElement } from "../../render/types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualState } from "./use-visual-state"
import { LazyContext } from "../../context/LazyContext"
import { MotionConfigProps } from "../../components/MotionConfig"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import type { VisualElement } from "../../render/VisualElement"
import { optimizedAppearDataAttribute } from "../../animation/optimized-appear/data-id"
import { appearStoreId } from "../../animation/optimized-appear/store-id"

let hydrationErrorDetected = false

export function useVisualElement<Instance, RenderState>(
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>,
    visualState: VisualState<Instance, RenderState>,
    props: MotionProps & MotionConfigProps,
    createVisualElement?: CreateVisualElement<Instance>
): VisualElement<Instance> | undefined {
    const parent = useVisualElementContext()
    const lazyContext = useContext(LazyContext)
    const presenceContext = useContext(PresenceContext)
    const reducedMotionConfig = useContext(MotionConfigContext).reducedMotion

    const visualElementRef = useRef<VisualElement<Instance>>()

    /**
     * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
     */
    createVisualElement = createVisualElement || lazyContext.renderer

    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState,
            parent,
            props,
            presenceId: presenceContext ? presenceContext.id : undefined,
            blockInitialAnimation: presenceContext
                ? presenceContext.initial === false
                : false,
            reducedMotionConfig,
        })
    }

    const visualElement = visualElementRef.current

    useIsomorphicLayoutEffect(() => {
        visualElement && visualElement.render()
    })

    const animateChanges = () => {
        if (visualElement && visualElement.animationState) {
            visualElement.animationState.animateChanges()
        }
    }

    const hasAnimated = useRef(false)
    const skipInitialAnimation = useRef(false)

    /**
     * If we've encountered a hydration error, we need to animate initial changes
     * from a synchronous useLayoutEffect to ensure there's no flash of incorrectly
     * styled elements.
     */
    useIsomorphicLayoutEffect(() => {
        if (
            window.MotionAppearAnimations &&
            props[optimizedAppearDataAttribute] &&
            visualElement
        ) {
            const animation = window.MotionAppearAnimations.get(
                appearStoreId(props[optimizedAppearDataAttribute], "opacity")
            )

            console.log(animation.effect.target, visualElement.current)
            if (
                animation &&
                animation.effect &&
                animation.effect.target &&
                animation.effect.target !== visualElement.current
            ) {
                console.log("hydration error detected")
                hydrationErrorDetected = true
            }
        }

        if (hydrationErrorDetected) {
            animateChanges()
            skipInitialAnimation.current = true
        }
    }, [])

    useEffect(() => {
        if (hasAnimated.current || !skipInitialAnimation.current) {
            animateChanges()
        }
        hasAnimated.current = true
    })

    return visualElement
}
