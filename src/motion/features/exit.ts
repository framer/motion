import { useRef, useEffect, useContext } from "react"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"
import { AnimationControls } from "../../animation/AnimationControls"
import { checkShouldInheritVariant } from "../utils/should-inherit-variant"
import { usePresence } from "../../components/AnimatePresence/use-presence"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { useAnimationControls } from "../utils/use-animation-controls"

const ExitComponent = makeRenderlessComponent((props: FeatureProps) => {
    const { animate, exit, visualElement } = props
    const controls = useAnimationControls(visualElement)
    const [isPresent, onExitComplete] = usePresence()
    const presenceContext = useContext(PresenceContext)
    const isPlayingExitAnimation = useRef(false)

    const custom =
        presenceContext?.custom !== undefined
            ? presenceContext.custom
            : props.custom

    useEffect(() => {
        if (!isPresent) {
            if (!isPlayingExitAnimation.current && exit) {
                controls.start(exit, { custom }).then(onExitComplete)
            }

            isPlayingExitAnimation.current = true
        } else if (
            isPlayingExitAnimation.current &&
            animate &&
            typeof animate !== "boolean" &&
            !(animate instanceof AnimationControls)
        ) {
            controls.start(animate)
        }

        if (isPresent) {
            isPlayingExitAnimation.current = false
        }
    }, [animate, controls, custom, exit, isPresent, onExitComplete, props])
})

/**
 * @public
 */
export const Exit: MotionFeature = {
    key: "exit",
    shouldRender: (props) => !!props.exit && !checkShouldInheritVariant(props),
    getComponent: () => ExitComponent,
}
