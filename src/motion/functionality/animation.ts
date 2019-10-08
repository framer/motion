import { ComponentType } from "react"
import { MotionProps, AnimatePropType, VariantLabels } from "../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariants } from "../../animation/use-variants"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { TargetAndTransition } from "../../types"

interface AnimationFunctionalProps {
    initial: MotionProps["initial"]
    animate: MotionProps["animate"]
    transition: MotionProps["transition"]
    variants: MotionProps["variants"]
    controls: ValueAnimationControls
    values: MotionValuesMap
    inherit: boolean
}

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeRenderlessComponent<AnimationFunctionalProps>(
        ({
            animate,
            controls,
            values,
            transition,
        }: AnimationFunctionalProps) => {
            return useAnimateProp(
                animate as TargetAndTransition,
                controls,
                values,
                transition
            )
        }
    ),
    [AnimatePropType.VariantLabel]: makeRenderlessComponent<
        AnimationFunctionalProps
    >(
        ({
            animate,
            inherit = true,
            controls,
            initial,
        }: AnimationFunctionalProps) => {
            return useVariants(
                initial as VariantLabels,
                animate as VariantLabels,
                inherit,
                controls
            )
        }
    ),
    [AnimatePropType.AnimationSubscription]: makeRenderlessComponent<
        AnimationFunctionalProps
    >(({ animate, controls }: AnimationFunctionalProps) => {
        return useAnimationGroupSubscription(
            animate as AnimationControls,
            controls
        )
    }),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: AnimationFunctionalProps) =>
    animate instanceof AnimationControls

const animationProps = ["initial", "animate", "whileTap", "whileHover"]

const animatePropTypeTests = {
    [AnimatePropType.Target]: (props: AnimationFunctionalProps) => {
        return (
            props.animate !== undefined &&
            !isVariantLabel(props.animate) &&
            !isAnimationSubscription(props)
        )
    },
    [AnimatePropType.VariantLabel]: (props: AnimationFunctionalProps) => {
        return (
            props.variants !== undefined ||
            animationProps.some(key => typeof props[key] === "string")
        )
    },
    [AnimatePropType.AnimationSubscription]: isAnimationSubscription,
}

export const getAnimationComponent = (
    props: MotionProps
): ComponentType<AnimationFunctionalProps> | undefined => {
    let animatePropType: AnimatePropType | undefined = undefined

    for (const key in AnimatePropType) {
        if (animatePropTypeTests[key](props)) {
            animatePropType = key as AnimatePropType
        }
    }

    return animatePropType ? AnimatePropComponents[animatePropType] : undefined
}
