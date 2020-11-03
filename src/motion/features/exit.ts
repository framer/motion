import { useEffect, useContext } from "react"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"
import { checkShouldInheritVariant } from "../utils/should-inherit-variant"
import { usePresence } from "../../components/AnimatePresence/use-presence"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { AnimationType } from "../../animation/use-animation-state"

const ExitComponent = makeRenderlessComponent((props: FeatureProps) => {
    const { visualElement } = props
    const [isPresent, onExitComplete] = usePresence()
    const presenceContext = useContext(PresenceContext)

    useEffect(() => {
        const custom =
            presenceContext?.custom !== undefined
                ? presenceContext.custom
                : props.custom

        const animation = visualElement.animationState?.setActive(
            AnimationType.Exit,
            !isPresent
            //TODO Pass custom
        )

        if (!isPresent) {
            animation.then(onExitComplete)
        }
    }, [isPresent])
})

/**
 * @public
 */
export const Exit: MotionFeature = {
    key: "exit",
    shouldRender: (props) => !!props.exit && !checkShouldInheritVariant(props),
    getComponent: () => ExitComponent,
}
