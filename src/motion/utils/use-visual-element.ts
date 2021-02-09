import {
    ComponentType,
    MutableRefObject,
    Ref,
    useContext,
    useEffect,
    useRef,
} from "react"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { LayoutGroupContext } from "../../components/AnimateSharedLayout/LayoutGroupContext"
import {
    isSharedLayout,
    SharedLayoutContext,
} from "../../components/AnimateSharedLayout/SharedLayoutContext"
import { MotionProps } from "../../motion"
import { useVisualElementContext } from "../../motion/context/MotionContext"
import { useSnapshotOnUnmount } from "../../motion/features/layout/use-snapshot-on-unmount"
import { CreateVisualElement, VisualElement } from "../../render/types"
import { useConstant } from "../../utils/use-constant"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"

function useLayoutId({ layoutId }: MotionProps) {
    const layoutGroupId = useContext(LayoutGroupContext)
    return layoutGroupId && layoutId ? layoutGroupId + "-" + layoutId : layoutId
}

function useSnapshotOfLeadVisualElement(layoutId?: string) {
    const syncLayout = useContext(SharedLayoutContext)

    return useConstant(() => {
        if (!isSharedLayout(syncLayout) || !layoutId) return

        const lead = syncLayout.getLeadVisualElement(layoutId)
        return lead ? { ...lead.getLatestValues() } : undefined
    })
}

type VisualElementRef = MutableRefObject<VisualElement | null>

export function useVisualElement<E>(
    createVisualElement: CreateVisualElement<E>,
    Component: string | ComponentType,
    props: MotionProps,
    isStatic: boolean,
    ref?: Ref<E>
): VisualElement<E> {
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)
    const layoutId = useLayoutId(props)
    const snapshot = useSnapshotOfLeadVisualElement(layoutId)

    const visualElementRef: VisualElementRef = useRef(null)

    if (isStatic && visualElementRef.current) {
        /**
         * Clear the VisualElement state in static mode after the initial render.
         * This will allow the VisualElement to render every render as if its the first,
         * with no history. This is basically a cheaper way of reinstantiating the VisualElement
         * every render.
         */
        visualElementRef.current.clearState(props)
    } else if (!visualElementRef.current) {
        visualElementRef.current = createVisualElement(Component, isStatic, {
            parent,
            ref,
            isStatic,
            props: { ...props, layoutId },
            snapshot,
            presenceId: presenceContext?.id,
            blockInitialAnimation: presenceContext?.initial === false,
        })
    }

    const visualElement = visualElementRef.current

    useIsomorphicLayoutEffect(() => {
        visualElement.setProps({ ...props, layoutId })
        visualElement.isPresent = isPresent(presenceContext)
        visualElement.isPresenceRoot =
            !parent || parent.presenceId !== presenceContext?.id

        /**
         * Fire a render to ensure the latest state is reflected on-screen.
         */
        if (!visualElement.isStatic) visualElement.syncRender()
    })

    /**
     * Don't fire unnecessary effects if this is a static component.
     */
    if (isStatic) return visualElement

    useEffect(() => {
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
