import { hover } from "../../gestures/hover"
import { focus } from "../../gestures/focus"
import { useTapGesture } from "../../gestures/use-tap-gesture"
import { useViewport } from "./viewport/use-viewport"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureComponents } from "./types"

export const gestureAnimations: FeatureComponents = {
    inView: makeRenderlessComponent(useViewport),
    tap: makeRenderlessComponent(useTapGesture),
    focus: {
        type: "vanilla",
        feature: focus,
    },
    hover: {
        type: "vanilla",
        feature: hover,
    },
}
