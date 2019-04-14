import { ComponentType } from "react"
import { MotionProps, AnimatePropType, VariantLabels } from "../types"
import { FunctionalProps } from "./types"
import { makeHookComponent } from "../utils/make-hook-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariants } from "../../animation/use-variants"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { Target } from "../../types"

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeHookComponent(
        ({ animate, controls, values, transition }: FunctionalProps) => {
            return useAnimateProp(
                animate as Target,
                controls,
                values,
                transition
            )
        }
    ),
    [AnimatePropType.VariantLabel]: makeHookComponent(
        ({ animate, inherit = true, controls, initial }: FunctionalProps) => {
            return useVariants(
                animate as VariantLabels,
                inherit,
                controls,
                initial as VariantLabels
            )
        }
    ),
    [AnimatePropType.AnimationSubscription]: makeHookComponent(
        ({ animate, controls }: FunctionalProps) => {
            return useAnimationGroupSubscription(
                animate as AnimationControls,
                controls
            )
        }
    ),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: FunctionalProps) =>
    animate instanceof AnimationControls

const animationProps = ["initial", "animate", "whileTap", "whileHover"]

const animatePropTypeTests = {
    [AnimatePropType.Target]: (props: FunctionalProps) => {
        return (
            props.animate !== undefined &&
            !isVariantLabel(props.animate) &&
            !isAnimationSubscription(props)
        )
    },
    [AnimatePropType.VariantLabel]: (props: FunctionalProps) => {
        return (
            props.variants !== undefined ||
            animationProps.some(key => typeof props[key] === "string")
        )
    },
    [AnimatePropType.AnimationSubscription]: isAnimationSubscription,
}

export const getAnimateComponent = (
    props: MotionProps,
    isStatic: boolean = false
): ComponentType<FunctionalProps> | undefined => {
    let animatePropType: AnimatePropType | undefined = undefined

    for (const key in AnimatePropType) {
        if (animatePropTypeTests[key](props)) {
            animatePropType = key as AnimatePropType
        }
    }

    return !isStatic && animatePropType
        ? AnimatePropComponents[animatePropType]
        : undefined
}
