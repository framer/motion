import { ComponentType } from "react"
import { MotionProps, AnimatePropType, VariantLabels } from "../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariants } from "../../animation/use-variants"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { TargetAndTransition } from "../../types"
import { FeatureProps, MotionFeature } from "./types"

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeRenderlessComponent<FeatureProps>(
        ({ animate, controls, visualElement, transition }: FeatureProps) => {
            return useAnimateProp(
                animate as TargetAndTransition,
                controls,
                visualElement,
                transition
            )
        }
    ),
    [AnimatePropType.VariantLabel]: makeRenderlessComponent<FeatureProps>(
        ({ animate, inherit = true, controls, initial }: FeatureProps) => {
            return useVariants(
                initial as VariantLabels,
                animate as VariantLabels,
                inherit,
                controls
            )
        }
    ),
    [AnimatePropType.AnimationSubscription]: makeRenderlessComponent<
        FeatureProps
    >(({ animate, controls }: FeatureProps) => {
        return useAnimationGroupSubscription(
            animate as AnimationControls,
            controls
        )
    }),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: FeatureProps) =>
    animate instanceof AnimationControls

const animationProps = ["initial", "animate", "whileTap", "whileHover"]

const animatePropTypeTests = {
    [AnimatePropType.Target]: (props: FeatureProps) => {
        return (
            props.animate !== undefined &&
            !isVariantLabel(props.animate) &&
            !isAnimationSubscription(props)
        )
    },
    [AnimatePropType.VariantLabel]: (props: FeatureProps) => {
        return (
            props.variants !== undefined ||
            animationProps.some(key => typeof props[key] === "string")
        )
    },
    [AnimatePropType.AnimationSubscription]: isAnimationSubscription,
}

export const getAnimationComponent = (
    props: MotionProps
): ComponentType<FeatureProps> | undefined => {
    let animatePropType: AnimatePropType | undefined = undefined

    for (const key in AnimatePropType) {
        if (animatePropTypeTests[key](props)) {
            animatePropType = key as AnimatePropType
        }
    }

    return animatePropType ? AnimatePropComponents[animatePropType] : undefined
}

export const Animation: MotionFeature = {
    key: "animation",
    shouldRender: () => true,
    getComponent: getAnimationComponent,
}
