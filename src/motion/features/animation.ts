import { useEffect } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { createAnimationState } from "../../render/VisualElement/utils/animation-state"
import { useVariantContext } from "../context/MotionContext"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"

const AnimationState = makeRenderlessComponent((props: FeatureProps) => {
    const { visualElement, animate } = props

    if (!visualElement.animationState) {
        visualElement.animationState = createAnimationState(visualElement)
    }

    const variantContext = useVariantContext()

    useEffect(() => {
        visualElement.animationState!.setProps(props, variantContext)
    })

    if (animate instanceof AnimationControls) {
        useAnimationGroupSubscription(visualElement, animate)
    }
})

/**
 * @public
 */
export const Animation: MotionFeature = {
    key: "animation",
    shouldRender: () => true,
    getComponent: ({
        animate,
        whileHover,
        whileTap,
        whileDrag,
        exit,
        variants,
    }) => {
        return animate ||
            whileHover ||
            whileTap ||
            whileDrag ||
            exit ||
            variants
            ? AnimationState
            : undefined
    },
}
