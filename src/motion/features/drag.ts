import { MotionProps } from "../types"
import { useDrag } from "../../gestures/drag/use-drag"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"
import { expectsResolvedDragConstraints } from "../../gestures/drag/VisualElementDragControls"

const Component = makeRenderlessComponent(
    ({ visualElement, ...props }: FeatureProps) => {
        return useDrag(props, visualElement)
    }
)

/**
 * @public
 */
export const Drag: MotionFeature = {
    key: "drag",
    shouldRender: (props: MotionProps) =>
        !!props.drag || expectsResolvedDragConstraints(props),
    getComponent: () => Component,
}
