import { VisualElement } from "./VisualElement"
import { MotionProps } from "../motion/types"
import { Ref } from "react"

export type UseVisualElement<E, P = MotionProps> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps & P,
    parent?: VisualElement,
    isStatic?: boolean,
    ref?: Ref<E>
) => VisualElement

export interface ResolvedValues {
    [key: string]: string | number
}

export interface VisualElementConfig {
    onUpdate?: MotionProps["onUpdate"]
}
