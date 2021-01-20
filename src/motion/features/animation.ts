import { useEffect } from "react"
import { isAnimationControls } from "../../animation/AnimationControls"
import { createAnimationState } from "../../render/utils/animation-state"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"

const AnimationState = makeRenderlessComponent((props: FeatureProps) => {
    const { visualElement, animate } = props

    /**
     * We dynamically generate the AnimationState manager as it contains a reference
     * to the underlying animation library. We only want to load that if we load this,
     * so people can optionally code split it out using the `m` component.
     */
    visualElement.animationState ||= createAnimationState(visualElement)

    /**
     * Subscribe any provided AnimationControls to the component's VisualElement
     */
    if (isAnimationControls(animate)) {
        useEffect(() => animate.subscribe(visualElement), [animate])
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
        whileFocus,
        whileTap,
        whileDrag,
        exit,
        variants,
    }) => {
        return animate ||
            whileHover ||
            whileFocus ||
            whileTap ||
            whileDrag ||
            exit ||
            variants
            ? AnimationState
            : undefined
    },
}
