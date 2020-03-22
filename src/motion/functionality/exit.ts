import { useRef, useEffect, useContext } from "react"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { AnimationControls } from "../../animation/AnimationControls"
import { checkShouldInheritVariant } from "../utils/should-inherit-variant"
import { usePresence } from "../../components/AnimatePresence/use-presence"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"

export const Exit: FunctionalComponentDefinition = {
    key: "exit",
    shouldRender: props => !!props.exit && !checkShouldInheritVariant(props),
    Component: makeRenderlessComponent((props: FunctionalProps) => {
        const { animate, controls, exit } = props
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
                    controls.setProps({
                        ...props,
                        custom,
                    })
                    controls.start(exit).then(onExitComplete)
                }

                isPlayingExitAnimation.current = true
            } else if (
                isPlayingExitAnimation.current &&
                animate &&
                !(animate instanceof AnimationControls)
            ) {
                controls.start(animate)
            }

            if (isPresent) {
                isPlayingExitAnimation.current = false
            }
        }, [isPresent])
    }),
}
