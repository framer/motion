import { useRef, useEffect } from "react"
import { invariant } from "hey-listen"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { AnimationControls } from "../../animation/AnimationControls"

export const Exit: FunctionalComponentDefinition = {
    key: "exit",
    shouldRender: ({ exit }, { exitProps }) => {
        const hasExitProps = !!exitProps
        const hasExitAnimation = !!exit

        invariant(
            !hasExitProps || (hasExitProps && hasExitAnimation),
            "No exit prop defined on a child of AnimatePresence."
        )

        return hasExitProps && hasExitAnimation
    },
    Component: makeRenderlessComponent((props: FunctionalProps) => {
        const { animate, controls, parentContext, exit } = props
        const { exitProps } = parentContext
        const isPlayingExitAnimation = useRef(false)

        // This early return is more for types - it won't actually run because of the `shouldRender` above.
        if (!exitProps || !exit) return

        const { isExiting, custom, onExitComplete } = exitProps

        useEffect(
            () => {
                if (isExiting) {
                    if (!isPlayingExitAnimation.current && exit) {
                        controls.setProps({
                            ...props,
                            custom:
                                custom !== undefined ? custom : props.custom,
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
            },
            [isExiting]
        )
    }),
}
