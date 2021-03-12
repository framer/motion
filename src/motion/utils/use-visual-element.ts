import { useContext, useEffect } from "react"
import { PresenceContext } from "../../context/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { LayoutGroupContext } from "../../context/LayoutGroupContext"
import { MotionProps } from "../../motion"
import { useVisualElementContext } from "../../context/MotionContext"
import { useSnapshotOnUnmount } from "../../motion/features/layout/use-snapshot-on-unmount"
import { CreateVisualElement, VisualElement } from "../../render/types"
import { useConstant } from "../../utils/use-constant"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { VisualState } from "./use-visual-state"

function useLayoutId({ layoutId }: MotionProps) {
    const layoutGroupId = useContext(LayoutGroupContext)
    return layoutGroupId && layoutId !== undefined
        ? layoutGroupId + "-" + layoutId
        : layoutId
}

export function useVisualElement<Instance, RenderState>(
    isStatic: boolean,
    visualState: VisualState<Instance, RenderState>,
    createVisualElement: CreateVisualElement<Instance>,
    props: MotionProps
): VisualElement<Instance> {
    const config = useContext(MotionConfigContext)
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)
    const layoutId = useLayoutId(props)

    const visualElement = useConstant(() =>
        createVisualElement(isStatic, {
            visualState,
            parent,
            props: { ...props, layoutId },
            presenceId: presenceContext?.id,
            blockInitialAnimation: presenceContext?.initial === false,
        })
    )

    useIsomorphicLayoutEffect(() => {
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
        /**
         * In a future refactor we can replace the features-as-components and
         * have this loop through them all firing "effect" listeners
         */
        visualElement.animationState?.animateChanges()
    })

    /**
     * If this component is a child of AnimateSharedLayout, we need to snapshot the component
     * before it's unmounted. This lives here rather than in features/layout/Measure because
     * as a child component its unmount effect runs after this component has been unmounted.
     */
    useSnapshotOnUnmount(visualElement)

    return visualElement
}
