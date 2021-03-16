import { useContext } from "react"
import { isAnimationControls } from "../../animation/animation-controls"
import {
    PresenceContext,
    PresenceContextProps,
} from "../../context/PresenceContext"
import { ResolvedValues, ScrapeMotionValuesFromProps } from "../../render/types"
import {
    checkIfControllingVariants,
    checkIfVariantNode,
    resolveVariantFromProps,
} from "../../render/utils/variants"
import { useConstant } from "../../utils/use-constant"
import { resolveMotionValue } from "../../value/utils/resolve-motion-value"
import { MotionContext, MotionContextProps } from "../../context/MotionContext"
import { MotionProps } from "../types"

export interface VisualState<Instance, RenderState> {
    renderState: RenderState
    latestValues: ResolvedValues
    mount?: (instance: Instance) => void
}

export type UseVisualState<Instance, RenderState> = (
    props: MotionProps,
    isStatic: boolean
) => VisualState<Instance, RenderState>

export interface UseVisualStateConfig<Instance, RenderState> {
    scrapeMotionValuesFromProps: ScrapeMotionValuesFromProps
    createRenderState: () => RenderState
    onMount?: (
        props: MotionProps,
        instance: Instance,
        visualState: VisualState<Instance, RenderState>
    ) => void
}

function makeState<I, RS>(
    {
        scrapeMotionValuesFromProps,
        createRenderState,
        onMount,
    }: UseVisualStateConfig<I, RS>,
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null
) {
    const state: VisualState<I, RS> = {
        latestValues: makeLatestValues(
            props,
            context,
            presenceContext,
            scrapeMotionValuesFromProps
        ),
        renderState: createRenderState(),
    }

    if (onMount) {
        state.mount = (instance: I) => onMount(props, instance, state)
    }

    return state
}

export const makeUseVisualState = <I, RS>(
    config: UseVisualStateConfig<I, RS>
): UseVisualState<I, RS> => (
    props: MotionProps,
    isStatic: boolean
): VisualState<I, RS> => {
    const context = useContext(MotionContext)
    const presenceContext = useContext(PresenceContext)

    return isStatic
        ? makeState(config, props, context, presenceContext)
        : useConstant(() => makeState(config, props, context, presenceContext))
}

function makeLatestValues(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null,
    scrapeMotionValues: ScrapeMotionValuesFromProps
) {
    const values: ResolvedValues = {}
    const blockInitialAnimation = presenceContext?.initial === false

    const motionValues = scrapeMotionValues(props)
    for (const key in motionValues) {
        values[key] = resolveMotionValue(motionValues[key])
    }

    let { initial, animate } = props
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = checkIfVariantNode(props)

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
