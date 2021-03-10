import { useContext, useMemo } from "react"
import { isAnimationControls } from "../../animation/animation-controls"
import {
    PresenceContext,
    PresenceContextProps,
} from "../../components/AnimatePresence/PresenceContext"
import { ResolvedValues } from "../../render/types"
import {
    checkIfControllingVariants,
    resolveVariantFromProps,
} from "../../render/utils/variants"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { MotionContext, MotionContextProps } from "../context/MotionContext"
import { MotionProps } from "../types"
import { isForcedMotionValue } from "./is-forced-motion-value"

export const makeCreateVisualState = (
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null
) => () => {
    const values: ResolvedValues = {}
    const blockInitialAnimation = presenceContext?.initial === false

    /**
     * TODO: Make this renderer specific using the scrapMotionProps
     *
     * const motionValues = scrapeMotionValues()
     *
     */
    const { style } = props
    for (const key in style) {
        if (isMotionValue(style[key])) {
            values[key] = style[key].get()
        } else if (isForcedMotionValue(key, props)) {
            values[key] = style[key]
        }
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
    isStatic: boolean
): ResolvedValues {
    const createVisualState = makeCreateVisualState(
        props,
        useContext(MotionContext),
        useContext(PresenceContext)
    )

    return isStatic ? createVisualState() : useMemo(createVisualState, [])
}
