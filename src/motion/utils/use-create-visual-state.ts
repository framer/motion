import { useContext, useMemo } from "react"
import { isAnimationControls } from "../../animation/animation-controls"
import {
    PresenceContext,
    PresenceContextProps,
} from "../../components/AnimatePresence/PresenceContext"
import { ResolvedValues, ScrapeMotionValuesFromProps } from "../../render/types"
import {
    checkIfControllingVariants,
    resolveVariantFromProps,
} from "../../render/utils/variants"
import { resolveMotionValue } from "../../value/utils/resolve-motion-value"
import { MotionContext, MotionContextProps } from "../context/MotionContext"
import { MotionProps } from "../types"

export const makeCreateVisualState = (
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null,
    scrapeMotionValues: ScrapeMotionValuesFromProps
) => () => {
    const values: ResolvedValues = {}
    const blockInitialAnimation = presenceContext?.initial === false

    const motionValues = scrapeMotionValues(props)
    for (const key in motionValues) {
        values[key] = resolveMotionValue(motionValues[key])
    }

    let { initial, animate } = props
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = isControllingVariants || props.variants

    if (
        context &&
        isVariantNode &&
        !isControllingVariants &&
        props.inherit !== false
    ) {
        initial ??= context.initial
        animate ??= context.animate
    }

    const variantToSet =
        blockInitialAnimation || initial === false ? animate : initial

    if (
        variantToSet &&
        typeof variantToSet !== "boolean" &&
        !isAnimationControls(variantToSet)
    ) {
        const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet]
        list.forEach((definition) => {
            const resolved = resolveVariantFromProps(props, definition)
            if (!resolved) return

            const { transitionEnd, transition, ...target } = resolved

            for (const key in target) values[key] = target[key]
            for (const key in transitionEnd) values[key] = transitionEnd[key]
        })
    }

    return values
}

/**
 *
 */
export function useCreateVisualState(
    props: MotionProps,
    isStatic: boolean,
    scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps
): ResolvedValues {
    const createVisualState = makeCreateVisualState(
        props,
        useContext(MotionContext),
        useContext(PresenceContext),
        scrapeMotionValuesFromProps
    )

    return isStatic ? createVisualState() : useMemo(createVisualState, [])
}
