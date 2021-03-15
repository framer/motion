import { useDrag } from "../../gestures/drag/use-drag"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureBundle } from "./types"

export const drag: FeatureBundle = {
    drag: makeRenderlessComponent(useDrag),
}
