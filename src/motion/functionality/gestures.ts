import { MotionProps } from "../types"
import { useGestures } from "../../gestures"
import { FunctionalProps, FunctionalComponentDefinition } from "./types"
import { makeRenderlessComponent } from "../utils/make-renderless-component"

export const gestureProps = [
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onPanSessionStart",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "whileTap",
    "whileHover",
    "onHoverStart",
    "onHoverEnd",
]

export const Gestures: FunctionalComponentDefinition = {
    key: "gestures",
    shouldRender: (props: MotionProps) => {
        return gestureProps.some(key => props.hasOwnProperty(key))
    },
    Component: makeRenderlessComponent(
        ({ innerRef, ...props }: FunctionalProps) => {
            useGestures(props, innerRef)
        }
    ),
}
