import {
    ComponentType,
    MutableRefObject,
    Ref,
    useContext,
    useEffect,
    useMemo,
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
import {
    MotionContext,
    VisualElementTree,
} from "../../motion/context/MotionContext"
import { useSnapshotOnUnmount } from "../../motion/features/layout/use-snapshot-on-unmount"
import { useConstant } from "../../utils/use-constant"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualElement } from "../types"
import { checkIfControllingVariants } from "../utils/variants"
import { htmlVisualElement } from "./html-visual-element"
import { svgVisualElement } from "./svg-visual-element"
import { isSVGComponent } from "./utils/is-svg-component"

// TODO We can use a get snapshpt hook instead here
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

export function useDomVisualElement<E>(
    Component: string | ComponentType,
    props: MotionProps,
    isStatic: boolean,
    ref: Ref<E>
): VisualElementTree {
    const motionContext = useContext(MotionContext)
    const { parent, variantParent } = motionContext
    const presenceContext = useContext(PresenceContext)
    const layoutId = useLayoutId(props)
    const snapshot = useSnapshotOfLeadVisualElement(layoutId)

    const visualElementRef: MutableRefObject<VisualElement | null> = useRef(
        null
    )

    if (isStatic && visualElementRef.current) {
        visualElementRef.current.clearState(props)
    }

    if (!visualElementRef.current) {
        const isSVG = isSVGComponent(Component)
        // TODO: I believe this is the only DOM-specific line here, change useVisualElement to getVisualElementFactory
        const factory = isSVG ? svgVisualElement : htmlVisualElement

        visualElementRef.current = factory(
            {
                parent,
                variantParent:
                    props.inherit !== false ? variantParent : undefined,
                ref: ref as any,
                isStatic,
                props: { ...props, layoutId },
                snapshot,
                presenceId: presenceContext?.id,
                blockInitialAnimation: presenceContext?.initial === false,
            },
            { enableHardwareAcceleration: !isStatic && !isSVG }
        )
    }

    /**
     * Create motion context for children to ensure children re-render if new variants
     * are being passed. This is quite a blunt instrument and will lead to a ton of
     * unneccessary rerenders. In the future we might prefer something like AnimateSharedLayout
     * where incoming or re-rendering children trigger a rerender in the immediate
     * variant parent.
     */
    const visualElement = visualElementRef.current
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = isControllingVariants || props.variants

    const context = useMemo(
        () => ({
            parent: visualElement,
            variantParent: isVariantNode ? visualElement : variantParent,
        }),
        /**
         * If this is a variant node, always create a new context
         */
        [isVariantNode && !isStatic ? {} : motionContext]
    )

    useIsomorphicLayoutEffect(() => {
        visualElement.updateProps({ ...props, layoutId })

        /**
         * Update VisualElement with presence data
         */
        visualElement.isPresent = isPresent(presenceContext)
        visualElement.isPresenceRoot =
            !parent || parent.presenceId !== presenceContext?.id

        /**
         * What we want here is to clear the order of variant children in useLayoutEffect
         * then children can re-add themselves in useEffect. This should add them in the intended order
         * for staggerChildren to work correctly.
         */
        isPresent(presenceContext) && visualElement.variantChildren?.clear()

        // TODO: Fire visualElement layout listeners
        // TODO: Do we need this at all?
        if (!visualElement.isStatic) visualElement.syncRender()
    })

    if (visualElement.isStatic) return context

    useEffect(() => {
        visualElement.subscribeToVariantParent()

        // TODO: visualElement aalready has props, we can do better here
        visualElement.animationState?.setProps(props)

        // TODO: Fire visualElement effect listeners
    })

    /**
     * If this component is a child of AnimateSharedLayout, we need to snapshot the component
     * before it's unmounted. This lives here rather than in features/layout/Measure because
     * as a child component its unmount effect runs after this component has been unmounted.
     *
     * TODO: Fire visualElement unmount listeners
     */
    useSnapshotOnUnmount(visualElement)

    return context
}
