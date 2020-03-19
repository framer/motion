import { useRef, useEffect } from "react"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { AnimationControls } from "../../animation/AnimationControls"
import { checkShouldInheritVariant } from "../utils/should-inherit-variant"

export const Exit: FunctionalComponentDefinition = {
    key: "exit",
    shouldRender: props => !!props.exit && !checkShouldInheritVariant(props),
    Component: makeRenderlessComponent((props: FunctionalProps) => {
        const { animate, controls, parentContext, exit } = props
        const { exitProps } = parentContext
        const isPlayingExitAnimation = useRef(false)

        // This early return is more for types - it won't actually run because of the `shouldRender` above.
        if (!exitProps || !exit) return

        const { isExiting, custom, onExitComplete } = exitProps

        useEffect(() => {
            if (isExiting) {
                if (!isPlayingExitAnimation.current && exit) {
                    controls.setProps({
                        ...props,
                        custom: custom !== undefined ? custom : props.custom,
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

            if (!isExiting) {
                isPlayingExitAnimation.current = false
            }
        }, [isExiting])
    }),
}
