import { useContext, useEffect, useMemo } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { VisualElement } from "../../render/VisualElement"
import { variantPriorityOrder } from "../../render/VisualElement/utils/animation-state"
import { setValues } from "../../render/VisualElement/utils/setters"
import { useInitialOrEveryRender } from "../../utils/use-initial-or-every-render"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import {
    useVariantContext,
    VariantContextProps,
} from "../context/MotionContext"
import { MotionProps } from "../types"
import { checkShouldInheritVariant } from "./should-inherit-variant"

/**
 * This hook is resonsible for creating the variant-propagation tree
 * relationship between VisualElements.
 */
export function useVariants(
    visualElement: VisualElement,
    props: MotionProps,
    isStatic: boolean
) {
    let variantContext = useVariantContext()
    const presenceContext = useContext(PresenceContext)

    /**
     * We only add this VisualElement to the variant tree *if* we're:
     * 1. Being provided a variants prop
     * 2. Or being used to control variants (ie animate, whileHover etc)
     * 3. Or being passed AnimationControls, which we have to assume may control variants.
     * Otherwise this component should be "invisible" to variant propagation.
     */
    const shouldInheritVariants = checkShouldInheritVariant(props)
    const contextDependencies = []
    const context: VariantContextProps = {}

    let isControllingVariants = false
    if (checkIfControllingVariants(props)) {
        isControllingVariants = true
        variantContext = {}
    }
    const isVariantNode = isControllingVariants || props.variants

    /**
     * Loop through each animation prop. Create context dependencies.
     */
    for (let i = 0; i < numVariantProps; i++) {
        const name = variantProps[i]
        const prop = props[name]
        const contextProp = variantContext[name]

        if (isVariantLabel(prop) || prop === false) {
            context[name] = prop
            contextDependencies.push(prop)
        } else {
            if (isVariantLabel(contextProp) || contextProp === false) {
                context[name] = contextProp
            }
            contextDependencies.push(null)
        }

        contextDependencies.push(
            isVariantLabel(contextProp) ? contextProp : null
        )
    }

    const animate = props.animate ?? context.animate
    let { initial } = props
    if (
        initial === undefined &&
        (isVariantLabel(animate) || context.initial !== false)
    ) {
        initial = context.initial
    }

    if (presenceContext?.initial === false) {
        initial = context.initial = false
    }
    context.parent = isVariantNode ? visualElement : variantContext.parent

    useInitialOrEveryRender(() => {
        const initialToSet = initial === false ? animate : initial

        if (
            initialToSet &&
            typeof initialToSet !== "boolean" &&
            !isAnimationControls(initialToSet)
        ) {
            setValues(visualElement, initialToSet)
        }
    }, !isStatic)

    /**
     * We want to update the "base" (or fallback) value on the initial render.
     */
    useInitialOrEveryRender(() => {
        visualElement.forEachValue((value, key) => {
            visualElement.baseTarget[key] = value.get()
        })
    }, true)

    const nextContext = useMemo(() => context, contextDependencies)

    /**
     * Subscribe to the parent visualElement if this is a participant in the variant tree
     */
    let remove: undefined | (() => void)
    if (isVariantNode && shouldInheritVariants && !isControllingVariants) {
        remove = variantContext.parent?.addVariantChild(visualElement)
        visualElement.inheritsVariants = true
    }

    /**
     *
     */
    if (
        !isControllingVariants &&
        shouldInheritVariants &&
        visualElement.parent?.isMounted &&
        initial !== false &&
        animate
    ) {
        visualElement.manuallyAnimateOnMount = true
    }

    useEffect(() => {
        visualElement.isMounted = true

        return () => {
            visualElement.isMounted = false
            remove?.()
        }
    }, [])

    /**
     * What we want here is to clear the order of variant children in useLayoutEffect
     * then children can re-add themselves in useEffect. This should add them in the intended order
     * for staggerChildren to work correctly.
     */
    useIsomorphicLayoutEffect(() => {
        isPresent(presenceContext) &&
            visualElement.variantChildrenOrder?.clear()
    })

    useEffect(() => {
        isVariantNode &&
            variantContext.parent?.addVariantChildOrder(visualElement)
    })

    return nextContext
}

const variantProps = ["initial", ...variantPriorityOrder]
const numVariantProps = variantProps.length

function isVariantLabel(v?: MotionProps["animate"]): v is string | string[] {
    return typeof v === "string" || Array.isArray(v)
}

export function isAnimationControls(v?: unknown): v is AnimationControls {
    return typeof v === "object" && typeof (v as any).start === "function"
}

function checkIfControllingVariants(props: MotionProps) {
    return (
        typeof (props.animate as AnimationControls)?.start === "function" ||
        isVariantLabel(props.animate) ||
        isVariantLabel(props.whileHover) ||
        isVariantLabel(props.whileDrag) ||
        isVariantLabel(props.whileTap) ||
        isVariantLabel(props.whileFocus) ||
        isVariantLabel(props.exit)
    )
}
