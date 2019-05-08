import { createContext, useMemo } from "react"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { VariantLabels, MotionProps } from "../types"
import { useMaxTimes } from "../../utils/use-max-times"

type MotionContextProps = {
    controls?: ValueAnimationControls
    initial?: VariantLabels
    static?: boolean
}

/**
 * @internal
 */
export const MotionContext = createContext<MotionContextProps>({
    static: false,
})

const isVariantLabel = (v?: MotionProps["animate"]): v is string | string[] => {
    return typeof v === "string" || Array.isArray(v)
}

/**
 * Set up the context for children motion components.
 *
 * We also use this opportunity to apply `initial` values
 */
export const useMotionContext = (
    parentContext: MotionContextProps,
    controls: ValueAnimationControls,
    isStatic: boolean = false,
    { initial, animate, variants, whileTap, whileHover }: MotionProps
) => {
    // We pass on this component's ValueAnimationControls *if* we're being provided variants,
    // or if we're being used to control variants. Otherwise this component should be "invisible" to
    // variant propagation.
    const shouldPropagateControls =
        variants ||
        isVariantLabel(animate) ||
        isVariantLabel(whileTap) ||
        isVariantLabel(whileHover)

    // If this component's `initial` prop is a variant label, propagate it. Otherwise pass the parent's.
    const targetInitial = isVariantLabel(initial)
        ? initial
        : parentContext.initial

    // Only allow `initial` to trigger context re-renders if this is a `static` component (ie we're on the Framer canvas)
    // or in another non-animation/interaction environment.
    const initialDependency = isStatic ? targetInitial : null

    // Only allow `animate` to trigger context re-renders if it's a variant label. If this is an array of
    // variant labels there's probably an optimisation to deep-compare but it might be an over-optimisation.
    // We want to do this as we rely on React's component rendering order each render cycle to determine
    // the new order of any child components for the `staggerChildren` functionality.
    const animateDependency = isVariantLabel(animate) ? animate : null

    // The context to provide to the child. We `useMemo` because although `controls` and `initial` are
    // unlikely to change, by making the context an object it'll be considered a new value every render.
    // So all child motion components will re-render as a result.
    const context: MotionContextProps = useMemo(
        () => ({
            controls: shouldPropagateControls
                ? controls
                : parentContext.controls,
            initial: targetInitial,
        }),
        [initialDependency, animateDependency]
    )

    // Update the `static` property every render. This is unlikely to change but also essentially free.
    context.static = isStatic

    // Set initial state. If this is a static component (ie in Framer canvas), respond to updates
    // in `initial`.
    useMaxTimes(
        () => {
            const initialToApply = initial || parentContext.initial

            initialToApply && controls.apply(initialToApply)
        },
        isStatic ? Infinity : 1
    )

    return context
}
