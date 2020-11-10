import { useEffect } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { VisualElement } from "../../render/VisualElement"
import { startVisualElementAnimation } from "../../render/VisualElement/utils/animation"
import { createAnimationState } from "../../render/VisualElement/utils/animation-state"
import { TargetAndTransition } from "../../types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"

const AnimationState = makeRenderlessComponent((props: FeatureProps) => {
    const { visualElement, animate } = props

    if (!visualElement.animationState) {
        visualElement.animationState = createAnimationState(visualElement)
        visualElement.animate = createAnimateFunction(visualElement)
    }

    useEffect(() => {
        visualElement.animationState!.setProps(props)
    })

    animate instanceof AnimationControls &&
        useAnimationGroupSubscription(visualElement, animate)
})

function createAnimateFunction(visualElement: VisualElement) {
    return (
        animations:
            | string
            | string[]
            | TargetAndTransition
            | TargetAndTransition[],
        protectedValues?: Set<string>
    ) => {
        const animationList = Array.isArray(animations)
            ? animations
            : [animations]

        return Promise.all(
            animationList.map((definition) => {
                return startVisualElementAnimation(visualElement, definition, {
                    protectedValues,
                })
            })
        )
    }
}

/**
 * @public
 */
export const Animation: MotionFeature = {
    key: "animation",
    shouldRender: () => true,
    getComponent: ({ animate, whileHover, whileTap, whileDrag, exit }) => {
        return animate || whileHover || whileTap || whileDrag || exit
            ? AnimationState
            : undefined
    },
}
