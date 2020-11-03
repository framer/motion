import { useEffect } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { createAnimationState } from "../../render/VisualElement/utils/animation-state"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"

const AnimationState = makeRenderlessComponent((props: FeatureProps) => {
    const { visualElement, animate } = props

    if (!visualElement.animationState) {
        visualElement.animationState = createAnimationState(visualElement)
    }

    useEffect(() => {
        visualElement.animationState!.setProps(props)
    })

    animate instanceof AnimationControls &&
        useAnimationGroupSubscription(visualElement, animate)
})

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
