import { useEffect } from "react"
import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { gestureAnimations } from "../../motion/features/gestures"
import { FeatureBundle, FeatureProps } from "../../motion/features/types"
import { makeRenderlessComponent } from "../../motion/utils/make-renderless-component"
import { ResolvedValueTarget, Transition } from "../../types"
import { MotionValue } from "../../value"
import { createAnimationState } from "../utils/animation-state"
import { MotionOneVisualElement } from "../waapi/MotionOneVisualElement"
import { animate } from "@motionone/dom"
import { getValueTransition } from "../../animation/utils/transitions"

function startAnimation(
    key: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition: Transition,
    visualElement: MotionOneVisualElement
) {
    return value.start((onComplete) => {
        const valueTransition = getValueTransition(transition, key) || {}
        const controls = animate(
            visualElement.element!,
            { [key]: target[key] },
            valueTransition
        )

        controls.finished.then(onComplete)

        return () => {
            controls.stop()
        }
    })
}

/**
 * @public
 */
export const motionOne: FeatureBundle = {
    renderer: (_Component, config) => new MotionOneVisualElement(config) as any,
    animation: makeRenderlessComponent(
        ({ visualElement, animate: animateProp }: FeatureProps) => {
            /**
             * We dynamically generate the AnimationState manager as it contains a reference
             * to the underlying animation library. We only want to load that if we load this,
             * so people can optionally code split it out using the `m` component.
             */
            visualElement.animationState ||= createAnimationState(
                visualElement,
                startAnimation as any
            )

            /**
             * Subscribe any provided AnimationControls to the component's VisualElement
             */
            if (isAnimationControls(animateProp)) {
                useEffect(
                    () => animateProp.subscribe(visualElement),
                    [animateProp]
                )
            }
        }
    ),
    ...gestureAnimations,
}
