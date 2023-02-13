import * as React from "react"
import { useContext, useRef, useEffect, useInsertionEffect } from "react"
import { PresenceContext } from "../../context/PresenceContext"
import { MotionProps } from "../../motion/types"
import { useVisualElementContext } from "../../context/MotionContext"
import { CreateVisualElement } from "../../render/types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualState } from "./use-visual-state"
import { LazyContext } from "../../context/LazyContext"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import type { VisualElement } from "../../render/VisualElement"

export function useVisualElement<Instance, RenderState>(
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>,
    visualState: VisualState<Instance, RenderState>,
    props: MotionProps & Partial<MotionConfigContext>,
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
            presenceContext,
            blockInitialAnimation: presenceContext
                ? presenceContext.initial === false
                : false,
            reducedMotionConfig,
        })
    }

    const visualElement = visualElementRef.current

    useInsertionEffect(() => {
        if (!visualElement) return
        visualElement.update(props, presenceContext)
    })

    useIsomorphicLayoutEffect(() => {
        if (!visualElement) return
        visualElement.render()
    })

    useEffect(() => {
        if (!visualElement) return
        visualElement.updateFeatures()
    })

    /**
     * Ideally this function would always run in a useEffect.
     *
     * However, if we have optimised appear animations to handoff from,
     * it needs to happen synchronously to ensure there's no flash of
     * incorrect styles in the event of a hydration error.
     *
     * So if we detect a situtation where optimised appear animations
     * are running, we use useLayoutEffect to trigger animations.
     */
    const useAnimateChangesEffect = window.HandoffAppearAnimations
        ? useIsomorphicLayoutEffect
        : useEffect
    useAnimateChangesEffect(() => {
        if (visualElement && visualElement.animationState) {
            visualElement.animationState.animateChanges()
        }
    })

    return visualElement
}
