import { RefObject } from "react"
import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"
import { HoverHandlers, useHoverGesture } from "./use-hover-gesture"

export type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers
export const useGestures = <P extends GestureHandlers>(
    props: P,
    ref: RefObject<Element>
) => {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
    useHoverGesture(props, ref)
}
