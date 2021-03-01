import { useEffect, useContext } from "react"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"
import { checkShouldInheritVariant } from "../utils/should-inherit-variant"
import { usePresence } from "../../components/AnimatePresence/use-presence"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { AnimationType } from "../../render/utils/types"

/**
 * TODO: This component is quite small and no longer directly imports animation code.
 * It could be a candidate for folding back into the main `motion` component.
 */
const ExitComponent = makeRenderlessComponent((props: FeatureProps) => {
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
})

/**
 * @public
 */
export const Exit: MotionFeature = {
    key: "exit",
    shouldRender: (props) => !!props.exit && !checkShouldInheritVariant(props),
    getComponent: () => ExitComponent,
}
