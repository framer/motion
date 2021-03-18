import { useFocusGesture } from "../../gestures/use-focus-gesture"
import { useHoverGesture } from "../../gestures/use-hover-gesture"
import { useTapGesture } from "../../gestures/use-tap-gesture"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureComponents } from "./types"

export const gestureAnimations: FeatureComponents = {
    tap: makeRenderlessComponent(useTapGesture),
    focus: makeRenderlessComponent(useFocusGesture),
    hover: makeRenderlessComponent(useHoverGesture),
}
