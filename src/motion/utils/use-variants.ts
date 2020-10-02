import { createContext, useContext, useEffect, useMemo } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { VisualElement } from "../../render/VisualElement"
import { setValues } from "../../render/VisualElement/utils/setters"
import { Target } from "../../types"
import { useInitialOrEveryRender } from "../../utils/use-initial-or-every-render"
import { MotionProps, VariantLabels } from "../types"

interface VariantContextProps {
    parent?: VisualElement
    initial?: string | string[]
    animate?: string | string[]
}

export const VariantContext = createContext<VariantContextProps>({})

/**
 * This hook is resonsible for creating the variant-propagation tree
 * relationship between VisualElements.
 */
export function useVariants(
    visualElement: VisualElement,
    { variants, initial, animate, whileTap, whileHover }: MotionProps,
    isStatic: boolean
): VariantContextProps {
    const { parent, initial: parentInitial } = useContext(VariantContext)
    const presenceContext = useContext(PresenceContext)

    /**
     * We only add this VisualElement to the variant tree *if* we're:
     * 1. Being provided a variants prop
     * 2. Being used to control variants (ie animate, whileHover etc)
     * 3. Or being passed animation controls, which we have to assume may control variants
     * Otherwise this component should be "invisible" to variant propagation. This is a concession
     * to Framer which uses a `motion` component in every `Frame` and it might be if we change that
     * in the future that this restriction is removed.
     */
    const isVariantNode =
        variants ||
        isVariantLabel(animate) ||
        isVariantLabel(whileTap) ||
        isVariantLabel(whileHover) ||
        isAnimationControls(animate)

    /**
     * Override initial with one from a parent `AnimatePresence`, if present
     */
    initial = presenceContext?.initial ?? initial

    /**
     * If initial is false, and animate isn't animation controls, we assign animate
     * to initial and set our values to that for the initial render.
     */
    if (initial === false && !isAnimationControls(animate)) {
        initial = animate as Target | VariantLabels
    }

    const context = useMemo(
        (): VariantContextProps => ({
            parent: isVariantNode ? visualElement : parent,
            initial: isVariantLabel(initial) ? initial : parentInitial,
            animate: animate as string | string[], // TODO
        }),
        /**
         * Only create a new context value (thereby re-rendering children) if this
         * is a static component and `initial` changes.
         */
        [isStatic ? initial : null]
    )

    // Set initial state. If this is a static component (ie in Framer canvas), respond to updates
    // in `initial`.
    useInitialOrEveryRender(() => {
        const initialToApply = initial || parentInitial
        initialToApply && setValues(visualElement, initialToApply as any)
    }, !isStatic)

    /**
     * If this component isn't exiting the tree, clear all the children in the render phase.
     * This will allow children to resubscribe in the correct order to ensure the correct stagger order.
     */
    isPresent(presenceContext) && visualElement.variantChildren?.clear()

    /**
     * Subscribe to the propagated parent.
     */
    useEffect(() => {
        isVariantNode && parent?.addVariantChild(visualElement)
    })

    /**
     * Track mount status so children can detect whether they were present during the
     * component's initial mount.
     */
    useEffect(() => {
        visualElement.isMounted = true
        return () => {
            visualElement.isMounted = false
        }
    }, [])

    return context
}

function isVariantLabel(v?: MotionProps["animate"]): v is string | string[] {
    return typeof v === "string" || Array.isArray(v)
}

function isAnimationControls(
    v?: MotionProps["animate"]
): v is AnimationControls {
    return v instanceof AnimationControls
}
