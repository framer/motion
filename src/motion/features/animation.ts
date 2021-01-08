import { useEffect } from "react"
import { AnimationControls } from "../../animation/AnimationControls"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { createAnimationState } from "../../render/VisualElement/utils/animation-state"
import { useVariantContext } from "../context/MotionContext"
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

    const variantContext = useVariantContext()

    /**
     * Every render, we want to update the AnimationState with the latest props
     * and context. We could add these to the dependency list but as many of these
     * props can be objects or arrays it's not clear that we'd gain much performance.
     */
    useEffect(() => {
        visualElement.animationState!.setProps(
            props,
            visualElement.inheritsVariants ? variantContext : undefined
        )
    })

    /**
     * Subscribe any provided AnimationControls to the component's VisualElement
     */
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
