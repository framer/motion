import { RefObject } from "react"
import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"

export type GestureHandlers = PanHandlers & TapHandlers
export const useGestures = <P extends GestureHandlers>(props: P, ref: RefObject<Element>) => {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
}
