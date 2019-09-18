import { useRef, useEffect } from "react"
import { invariant } from "hey-listen"
import { makeHookComponent } from "../utils/make-hook-component"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"

export const Exit: FunctionalComponentDefinition = {
    key: "exit",
    shouldRender: (_props, { exitProps }) => {
        return !!(exitProps && exitProps.isExiting)
    },
    Component: makeHookComponent((props: FunctionalProps) => {
        const { controls, parentContext, exit } = props

        const isPlayingExitAnimation = useRef(false)
        const shouldPlayExitAnimation = useRef(false)

        useEffect(() => {
            invariant(!!exit, "No exit animation defined.")
            const { exitProps } = parentContext
            if (!shouldPlayExitAnimation.current || !exitProps || !exit) return

            isPlayingExitAnimation.current = true
            const { custom, onExitComplete } = exitProps

            controls.setProps({
                ...props,
                custom: custom !== undefined ? custom : props.custom,
            })

            controls.start(exit).then(onExitComplete)
        })

        // We only want to initiate the exit animation once, when the component first exits.
        shouldPlayExitAnimation.current = !isPlayingExitAnimation.current
    }),
}
