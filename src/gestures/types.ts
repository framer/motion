import { GestureHandlers } from "./use-gestures"

export type RemoveEvent = () => void

/**
 * @internal
 */
export const gestureProps: Array<keyof GestureHandlers> = [
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onPanSessionStart",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "whileFocus",
    "whileTap",
    "whileHover",
]
