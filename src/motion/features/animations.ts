import { useContext, useEffect } from "react"
import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { usePresence } from "../../components/AnimatePresence/use-presence"
import { PresenceContext } from "../../context/PresenceContext"
import { createAnimationState } from "../../render/utils/animation-state"
import { AnimationType } from "../../render/utils/types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureComponents, FeatureProps } from "./types"

export const animations: FeatureComponents = {
    animation: makeRenderlessComponent(
        ({ visualElement, animate }: FeatureProps) => {
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
        }
    ),
    exit: makeRenderlessComponent((props: FeatureProps) => {
        const { custom, visualElement } = props
        const [isPresent, onExitComplete] = usePresence()
        const presenceContext = useContext(PresenceContext)

        useEffect(() => {
            const animation = visualElement.animationState?.setActive(
                AnimationType.Exit,
                !isPresent,
                { custom: presenceContext?.custom ?? custom }
            )

            !isPresent && animation?.then(onExitComplete)
        }, [isPresent])
    }),
}
