import { useDrag } from "../../gestures/drag/use-drag"
import { usePanGesture } from "../../gestures/use-pan-gesture"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureComponents } from "./types"

export const drag: FeatureComponents = {
    pan: makeRenderlessComponent(usePanGesture),
    drag: makeRenderlessComponent(useDrag),
}
