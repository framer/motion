import { useDrag } from "../../gestures/drag/use-drag"
import { usePanGesture } from "../../gestures/use-pan-gesture"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureBundle } from "./types"

export const drag: FeatureBundle = {
    pan: makeRenderlessComponent(usePanGesture),
    drag: makeRenderlessComponent(useDrag),
}
