import { MotionProps } from "../types"
import { useGestures } from "../../gestures"
import { gestureProps } from "../../gestures/types"
import { FeatureProps, MotionFeature } from "./types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"

const GestureComponent = makeRenderlessComponent(
    ({ visualElement, ...props }: FeatureProps) => {
        useGestures(props, visualElement)
    }
)

/**
 * @public
 */
export const Gestures: MotionFeature = {
    key: "gestures",
    shouldRender: (props: MotionProps) => {
        return gestureProps.some((key) => props.hasOwnProperty(key))
    },
    getComponent: () => GestureComponent,
}
