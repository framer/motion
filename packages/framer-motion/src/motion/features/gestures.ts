import { HoverGesture } from "../../gestures/hover"
import { FocusGesture } from "../../gestures/focus"
import { PressGesture } from "../../gestures/press"
import { InViewFeature } from "./viewport/InViewFeature"
import { FeaturePackages } from "./types"

export const gestureAnimations: FeaturePackages = {
    inView: {
        Feature: InViewFeature,
    },
    tap: {
        Feature: PressGesture,
    },
    focus: {
        Feature: FocusGesture,
    },
    hover: {
        Feature: HoverGesture,
    },
}
