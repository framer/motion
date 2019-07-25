import { MotionProps } from "../types"
import { ExitProps } from "../context/MotionContext"
import { invariant } from "hey-listen"

export function applyExitProps<P>(
    props: P & MotionProps,
    { initial, isExiting, custom, onExitComplete }: ExitProps
): P & MotionProps {
    if (isExiting) {
        invariant(
            !!props.exit,
            "No exit animation defined. Sort yer fuckin life out "
        )

        return {
            ...props,
            custom: custom !== undefined ? custom : props.custom,
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
