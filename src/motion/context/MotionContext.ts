import * as React from "react"
import { useMemo, useRef, useEffect, RefObject } from "react"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { VariantLabels, MotionProps } from "../types"
import { useMaxTimes } from "../../utils/use-max-times"
import { AnimationControls } from "../../animation/AnimationControls"
import { Target } from "../../types"
import { MotionValuesMap } from "../utils/use-motion-values"

export interface ExitProps {
    initial?: false | VariantLabels
    isExiting?: boolean
    onExitComplete?: () => void
    custom?: any
}

export interface MotionContextProps {
    controls?: ValueAnimationControls
    values?: MotionValuesMap
    initial?: false | VariantLabels
    animate?: VariantLabels
    static?: boolean
    hasMounted?: RefObject<boolean>
    exitProps?: ExitProps
}

/**
 * @internal
 */
export const MotionContext = React.createContext<MotionContextProps>({
    static: false,
})

const isVariantLabel = (v?: MotionProps["animate"]): v is string | string[] => {
    return typeof v === "string" || Array.isArray(v)
}

const isAnimationControls = (
    v?: MotionProps["animate"]
): v is AnimationControls => {
    return v instanceof AnimationControls
}

/**
 * Set up the context for children motion components.
 *
 * We also use this opportunity to apply `initial` values
 */
export const useMotionContext = (
    parentContext: MotionContextProps,
    controls: ValueAnimationControls,
    values: MotionValuesMap,
    isStatic: boolean = false,
    { initial, animate, variants, whileTap, whileHover }: MotionProps
) => {
    // Override initial with that from a parent context, if defined
    if (
        parentContext.exitProps &&
        parentContext.exitProps.initial !== undefined
    ) {
        initial = parentContext.exitProps.initial
    }

    let initialState: Target | VariantLabels | undefined

    if (initial === false && !isAnimationControls(animate)) {
        initialState = animate as Target | VariantLabels
    } else if (typeof initial !== "boolean") {
        initialState = initial
    }

    // Track mounted status so children can detect whether they were present during their
    // parent's first render
    const hasMounted = useRef(false)

    // We propagate this component's ValueAnimationControls *if* we're being provided variants,
    // if we're being used to control variants, or if we're being passed animation controls.
    // Otherwise this component should be "invisible" to variant propagation. This is a slight concession
    // to Framer X where every `Frame` is a `motion` component and it might be if we change that in the future
    // that this restriction is removed.
    const shouldPropagateControls =
        variants ||
        isVariantLabel(animate) ||
        isVariantLabel(whileTap) ||
        isVariantLabel(whileHover) ||
        isAnimationControls(animate)

    // If this component's `initial` prop is a variant label, propagate it. Otherwise pass the parent's.
    const targetInitial = isVariantLabel(initialState)
        ? initialState
        : parentContext.initial

    // If this is a variant tree we need to propagate the `animate` prop in case new children are added after
    // the tree initially animates.
    const targetAnimate = isVariantLabel(animate)
        ? animate
        : parentContext.animate

    // Only allow `initial` to trigger context re-renders if this is a `static` component (ie we're on the Framer canvas)
    // or in another non-animation/interaction environment.
    const initialDependency = isStatic ? targetInitial : null

    // Only allow `animate` to trigger context re-renders if it's a variant label. If this is an array of
    // variant labels there's probably an optimisation to deep-compare but it might be an over-optimisation.
    // We want to do this as we rely on React's component rendering order each render cycle to determine
    // the new order of any child components for the `staggerChildren` functionality.
    const animateDependency =
        shouldPropagateControls && isVariantLabel(targetAnimate)
            ? targetAnimate
            : null

    // The context to provide to the child. We `useMemo` because although `controls` and `initial` are
    // unlikely to change, by making the context an object it'll be considered a new value every render.
    // So all child motion components will re-render as a result.
    const context: MotionContextProps = useMemo(
        () => ({
            controls: shouldPropagateControls
                ? controls
                : parentContext.controls,
            initial: targetInitial,
            animate: targetAnimate,
            values,
            hasMounted,
        }),
        [initialDependency, animateDependency]
    )

    // Update the `static` property every render. This is unlikely to change but also essentially free.
    context.static = isStatic

    // Set initial state. If this is a static component (ie in Framer canvas), respond to updates
    // in `initial`.
    useMaxTimes(
        () => {
            const initialToApply = initialState || parentContext.initial
            initialToApply && controls.apply(initialToApply)
        },
        isStatic ? Infinity : 1
    )

    useEffect(() => {
        hasMounted.current = true
    }, [])

    return context
}
