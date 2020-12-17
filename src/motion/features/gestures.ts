import { MotionProps } from "../types"
import { GestureHandlers, useGestures } from "../../gestures"
import { FeatureProps, MotionFeature } from "./types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"

export const gestureProps: Array<keyof GestureHandlers> = [
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onPanSessionStart",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "whileFocus",
    "whileTap",
    "whileHover",
]

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
