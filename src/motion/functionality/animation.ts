import { ComponentType, RefObject } from "react"
import { MotionProps, AnimatePropType, VariantLabels } from "../types"
import { makeHookComponent } from "../utils/make-hook-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariants } from "../../animation/use-variants"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../../motion/utils/use-motion-values"
import { TargetAndTransition } from "../../types"

interface AnimationFunctionalProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    innerRef: RefObject<Element | null>
    inherit: boolean
}

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeHookComponent<AnimationFunctionalProps>(
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
    [AnimatePropType.VariantLabel]: makeHookComponent<AnimationFunctionalProps>(
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
    [AnimatePropType.AnimationSubscription]: makeHookComponent<
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

export const getAnimateComponent = (
    props: MotionProps,
    isStatic: boolean = false
): ComponentType<AnimationFunctionalProps> | undefined => {
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
