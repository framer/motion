import { RefObject } from "react"
import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"
import { AnimationControls } from "motion/utils/use-animation-controls"

export type GestureHandlers = PanHandlers & TapHandlers
export const useGestures = <P extends GestureHandlers>(
    props: P,
    ref: RefObject<Element>,
    controls: AnimationControls<P>
) => {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
}
