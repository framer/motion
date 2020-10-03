import { ComponentType } from "react"
import { VariantLabels } from "../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { useVariantAnimations } from "../../animation/use-variant-animations"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { AnimationControls } from "../../animation/AnimationControls"
import { TargetAndTransition } from "../../types"
import { FeatureProps, MotionFeature } from "./types"
import { isVariantLabel } from "../../render/VisualElement/utils/variants"
import { isAnimationControls } from "../utils/use-variants"

const target = {
    shouldRender: (props: FeatureProps) => {
        return (
            props.animate !== undefined &&
            !isVariantLabel(props.animate) &&
            !isAnimationControls(props.animate)
        )
    },
    Component: makeRenderlessComponent<FeatureProps>(
        ({ animate, visualElement, transition }: FeatureProps) => {
            return useAnimateProp(
                visualElement,
                animate as TargetAndTransition,
                transition
            )
        }
    ),
}

const animationProps = ["initial", "animate", "whileTap", "whileHover"]
const variant = {
    shouldRender: (props: FeatureProps) => {
        return (
            props.variants !== undefined ||
            animationProps.some((key) => typeof props[key] === "string")
        )
    },
    Component: makeRenderlessComponent<FeatureProps>(
        ({ animate, inherit = true, visualElement, initial }: FeatureProps) => {
            return useVariantAnimations(
                visualElement,
                initial as VariantLabels,
                animate as VariantLabels,
                inherit
            )
        }
    ),
}

const controls = {
    shouldRender: isAnimationControls,
    Component: makeRenderlessComponent<FeatureProps>(
        ({ animate, visualElement }: FeatureProps) => {
            return useAnimationGroupSubscription(
                visualElement,
                animate as AnimationControls
            )
        }
    ),
}

export const getAnimationComponent = (
    props: FeatureProps
): ComponentType<FeatureProps> | undefined => {
    if (target.shouldRender(props)) {
        return target.Component
    } else if (variant.shouldRender(props)) {
        return variant.Component
    } else if (controls.shouldRender(props.animate)) {
        return controls.Component
    }
}

/**
 * @public
 */
export const Animation: MotionFeature = {
    key: "animation",
    shouldRender: () => true,
    getComponent: getAnimationComponent,
}
