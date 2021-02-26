import { VisualElement } from "../../types"
import { Object3DMotionProps } from "../types"
import { useHoverGesture } from "./use-hover-gesture"
import { useTapGesture } from "./use-tap-gesture"

export function useGestures(
    props: Object3DMotionProps,
    visualElement: VisualElement
) {
    return {
        ...useHoverGesture(props, visualElement),
        ...useTapGesture(props, visualElement),
    }
}
