import { DragGesture } from "../../gestures/drag"
import { PanGesture } from "../../gestures/pan"
import { HTMLProjectionNode } from "../../projection-entry"
import { MeasureLayout } from "./layout/MeasureLayout"
import { FeaturePackages } from "./types"

export const drag: FeaturePackages = {
    pan: {
        Feature: PanGesture,
    },
    drag: {
        Feature: DragGesture,
        ProjectionNode: HTMLProjectionNode,
        MeasureLayout,
    },
}
