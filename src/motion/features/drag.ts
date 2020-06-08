import { MotionProps } from "../types"
import { useDrag } from "../../behaviours/use-drag"
import { makeRenderlessComponent } from "../utils/make-renderless-component"
import { FeatureProps, MotionFeature } from "./types"

export const Drag: MotionFeature = {
    key: "drag",
    shouldRender: (props: MotionProps) => !!props.drag,
    Component: makeRenderlessComponent(
        ({ visualElement, controls, ...props }: FeatureProps) => {
            return useDrag(props, visualElement, controls)
        }
    ),
}
