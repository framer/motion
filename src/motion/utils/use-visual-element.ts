import * as React from "react"
import { MutableRefObject, useContext, useEffect, useRef } from "react"
import { PresenceContext } from "../../context/PresenceContext"
// import { isPresent } from "../../components/AnimatePresence/use-presence"
import { MotionProps } from "../../motion/types"
import { useVisualElementContext } from "../../context/MotionContext"
import { CreateVisualElement, VisualElement } from "../../render/types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { VisualState } from "./use-visual-state"
import { LazyContext } from "../../context/LazyContext"

export function useVisualElement<Instance, RenderState>(
    Component: string | React.ComponentType,
    visualState: VisualState<Instance, RenderState>,
    props: MotionProps,
    createVisualElement?: CreateVisualElement<Instance>
): VisualElement<Instance> | undefined {
    const config = useContext(MotionConfigContext)
    const lazyContext = useContext(LazyContext)
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)

    const visualElementRef: MutableRefObject<
        VisualElement | undefined
    > = useRef(undefined)

    /**
     * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
     */
    if (!createVisualElement) createVisualElement = lazyContext.renderer

    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState,
            parent,
            props,
            presenceId: presenceContext?.id,
            blockInitialAnimation: presenceContext?.initial === false,
        })
    }

    const visualElement = visualElementRef.current

    useIsomorphicLayoutEffect(() => {
        if (!visualElement) return

        visualElement.setProps({
            ...config,
            ...props,
        })

        // visualElement.isPresent = isPresent(presenceContext)
        visualElement.isPresenceRoot =
            !parent || parent.presenceId !== presenceContext?.id

        /**
         * Fire a render to ensure the latest state is reflected on-screen.
         */
        visualElement.syncRender()
    })

    useEffect(() => {
        if (!visualElement) return

        /**
         * In a future refactor we can replace the features-as-components and
         * have this loop through them all firing "effect" listeners
         */
        visualElement.animationState?.animateChanges()
    })

    useIsomorphicLayoutEffect(() => () => visualElement?.notifyUnmount(), [])

    return visualElement
}
