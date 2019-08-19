import { MotionProps } from "../types"
import { ExitProps } from "../context/MotionContext"
import { invariant } from "hey-listen"

export function applyExitProps<P>(
    props: P & MotionProps,
    { initial, isExiting, custom, onExitComplete }: ExitProps
): P & MotionProps {
    if (isExiting) {
        invariant(!!props.exit, "No exit animation defined.")

        return {
            ...props,
            /**
             * Overwrite user-defined `custom` with the one incoming from `AnimatePresence`.
             * This will only be defined when a component is exiting and it allows a user
             * to update `custom` even when a component has been removed from the tree.
             */
            custom: custom !== undefined ? custom : props.custom,
            // Animate to `exit` just by overwriting `animate`.
            animate: props.exit,
            onAnimationComplete: () => {
                onExitComplete && onExitComplete()
                props.onAnimationComplete && props.onAnimationComplete()
            },
        }
    } else if (initial === false) {
        return { ...props, initial }
    }

    return props
}
