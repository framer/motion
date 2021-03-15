import { useFocusGesture } from "../../gestures/use-focus-gesture"
import { useHoverGesture } from "../../gestures/use-hover-gesture"
import { usePanGesture } from "../../gestures/use-pan-gesture"
import { useTapGesture } from "../../gestures/use-tap-gesture"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureBundle } from "./types"

export const gestures: FeatureBundle = {
    tap: makeRenderlessComponent(useTapGesture),
    focus: makeRenderlessComponent(useFocusGesture),
    hover: makeRenderlessComponent(useHoverGesture),
    pan: makeRenderlessComponent(usePanGesture),
}
