import * as React from "react"
import { MutableRefObject, useContext, useEffect, useRef } from "react"
import { PresenceContext } from "../../context/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { LayoutGroupContext } from "../../context/LayoutGroupContext"
import { MotionProps } from "../../motion"
import { useVisualElementContext } from "../../context/MotionContext"
import { CreateVisualElement, VisualElement } from "../../render/types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { VisualState } from "./use-visual-state"
import { useUnmountEffect } from "../../utils/use-unmount-effect"

function useLayoutId({ layoutId }: MotionProps) {
    const layoutGroupId = useContext(LayoutGroupContext)
    return layoutGroupId && layoutId !== undefined
        ? layoutGroupId + "-" + layoutId
        : layoutId
}

export function useVisualElement<Instance, RenderState>(
    visualState: VisualState<Instance, RenderState>,
    props: MotionProps,
    Component: string | React.ComponentType,
    createVisualElement?: CreateVisualElement<Instance>
): VisualElement<Instance> | undefined {
    const config = useContext(MotionConfigContext)
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)
    const layoutId = useLayoutId(props)

    const visualElementRef: MutableRefObject<
        VisualElement | undefined
    > = useRef(undefined)

    if (createVisualElement === null) {
        createVisualElement = config.renderer
    }

    if (!visualElementRef.current && createVisualElement) {
        visualElementRef.current = createVisualElement(Component, {
            visualState,
            parent,
            props: { ...props, layoutId },
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
            layoutId,
        })

        visualElement.isPresent = isPresent(presenceContext)
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

    useUnmountEffect(() => visualElement?.notifyUnmount())

    return visualElement
}
