import { useContext } from "react"
import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import {
    PresenceContext,
    PresenceContextProps,
} from "../../context/PresenceContext"
import { ResolvedValues, ScrapeMotionValuesFromProps } from "../../render/types"
import { resolveVariantFromProps } from "../../render/utils/resolve-variants"
import { useConstant } from "../../utils/use-constant"
import { resolveMotionValue } from "../../value/utils/resolve-motion-value"
import { MotionContext, MotionContextProps } from "../../context/MotionContext"
import { MotionProps } from "../types"
import {
    isControllingVariants as checkIsControllingVariants,
    isVariantNode as checkIsVariantNode,
} from "../../render/utils/is-controlling-variants"

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

export const makeUseVisualState =
    <I, RS>(config: UseVisualStateConfig<I, RS>): UseVisualState<I, RS> =>
    (props: MotionProps, isStatic: boolean): VisualState<I, RS> => {
        const context = useContext(MotionContext)
        const presenceContext = useContext(PresenceContext)
        const make = () => makeState(config, props, context, presenceContext)

        return isStatic ? make() : useConstant(make)
    }

function makeLatestValues(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null,
    scrapeMotionValues: ScrapeMotionValuesFromProps
) {
    const values: ResolvedValues = {}

    const motionValues = scrapeMotionValues(props, {})
    for (const key in motionValues) {
        values[key] = resolveMotionValue(motionValues[key])
    }

    let { initial, animate } = props
    const isControllingVariants = checkIsControllingVariants(props)
    const isVariantNode = checkIsVariantNode(props)

    if (
        context &&
        isVariantNode &&
        !isControllingVariants &&
        props.inherit !== false
    ) {
        if (initial === undefined) initial = context.initial
        if (animate === undefined) animate = context.animate
    }

    let isInitialAnimationBlocked = presenceContext
        ? presenceContext.initial === false
        : false
    isInitialAnimationBlocked = isInitialAnimationBlocked || initial === false

    const variantToSet = isInitialAnimationBlocked ? animate : initial

    if (
        variantToSet &&
        typeof variantToSet !== "boolean" &&
        !isAnimationControls(variantToSet)
    ) {
        const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet]
        for (let i = 0; i < list.length; i++) {
            const resolved = resolveVariantFromProps(props, list[i] as any)
            if (resolved) {
                const { transitionEnd, transition, ...target } = resolved
                for (const key in target) {
                    let valueTarget = target[key as keyof typeof target]

                    if (Array.isArray(valueTarget)) {
                        /**
                         * Take final keyframe if the initial animation is blocked because
                         * we want to initialise at the end of that blocked animation.
                         */
                        const index = isInitialAnimationBlocked
                            ? valueTarget.length - 1
                            : 0
                        valueTarget = valueTarget[index]
                    }

                    if (valueTarget !== null) {
                        values[key] = valueTarget as string | number
                    }
                }
                for (const key in transitionEnd) {
                    values[key] = transitionEnd[
                        key as keyof typeof transitionEnd
                    ] as string | number
                }
            }
        }
    }

    return values
}
