import { useEffect } from "react"
import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { gestureAnimations } from "../../motion/features/gestures"
import { FeatureBundle, FeatureProps } from "../../motion/features/types"
import { makeRenderlessComponent } from "../../motion/utils/make-renderless-component"
import { ResolvedValueTarget, Transition } from "../../types"
import { MotionValue } from "../../value"
import { createAnimationState } from "../utils/animation-state"
import { MotionOneVisualElement } from "../waapi/MotionOneVisualElement"

function startAnimation(
    _key: string,
    _value: MotionValue,
    _target: ResolvedValueTarget,
    _transition: Transition
) {
    return new Promise<void>(() => {})
}

/**
 * @public
 */
export const motionOne: FeatureBundle = {
    renderer: (_Component, config) => new MotionOneVisualElement(config) as any,
    animation: makeRenderlessComponent(
        ({ visualElement, animate }: FeatureProps) => {
            /**
             * We dynamically generate the AnimationState manager as it contains a reference
             * to the underlying animation library. We only want to load that if we load this,
             * so people can optionally code split it out using the `m` component.
             */
            visualElement.animationState ||= createAnimationState(
                visualElement,
                startAnimation
            )

            /**
             * Subscribe any provided AnimationControls to the component's VisualElement
             */
            if (isAnimationControls(animate)) {
                useEffect(() => animate.subscribe(visualElement), [animate])
            }
        }
    ),
    ...gestureAnimations,
}
