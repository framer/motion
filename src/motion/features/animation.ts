import { ComponentType } from "react"
import { MotionProps, AnimatePropType, VariantLabels } from "../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariants } from "../../animation/use-variants"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { TargetAndTransition } from "../../types"
import { VisualElement } from "../../render/VisualElement"

interface AnimationFeatureProps {
    initial: MotionProps["initial"]
    animate: MotionProps["animate"]
    transition: MotionProps["transition"]
    variants: MotionProps["variants"]
    controls: VisualElementAnimationControls
    visualElement: VisualElement
    inherit: boolean
}

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeRenderlessComponent<AnimationFeatureProps>(
        ({
            animate,
            controls,
            visualElement,
            transition,
        }: AnimationFeatureProps) => {
            return useAnimateProp(
                animate as TargetAndTransition,
                controls,
                visualElement,
                transition
            )
        }
    ),
    [AnimatePropType.VariantLabel]: makeRenderlessComponent<
        AnimationFeatureProps
    >(
        ({
            animate,
            inherit = true,
            controls,
            initial,
        }: AnimationFeatureProps) => {
            return useVariants(
                initial as VariantLabels,
                animate as VariantLabels,
                inherit,
                controls
            )
        }
    ),
    [AnimatePropType.AnimationSubscription]: makeRenderlessComponent<
        AnimationFeatureProps
    >(({ animate, controls }: AnimationFeatureProps) => {
        return useAnimationGroupSubscription(
            animate as AnimationControls,
            controls
        )
    }),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: AnimationFeatureProps) =>
    animate instanceof AnimationControls

const animationProps = ["initial", "animate", "whileTap", "whileHover"]

const animatePropTypeTests = {
    [AnimatePropType.Target]: (props: AnimationFeatureProps) => {
        return (
            props.animate !== undefined &&
            !isVariantLabel(props.animate) &&
            !isAnimationSubscription(props)
        )
    },
    [AnimatePropType.VariantLabel]: (props: AnimationFeatureProps) => {
        return (
            props.variants !== undefined ||
            animationProps.some(key => typeof props[key] === "string")
        )
    },
    [AnimatePropType.AnimationSubscription]: isAnimationSubscription,
}

export const getAnimationComponent = (
    props: MotionProps
): ComponentType<AnimationFeatureProps> | undefined => {
    let animatePropType: AnimatePropType | undefined = undefined

    for (const key in AnimatePropType) {
        if (animatePropTypeTests[key](props)) {
            animatePropType = key as AnimatePropType
        }
    }

    return animatePropType ? AnimatePropComponents[animatePropType] : undefined
}
