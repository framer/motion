import { VisualElement } from "./VisualElement"
import { MotionProps } from "../motion/types"
import { Ref } from "react"

export type UseVisualElement<E, VE extends VisualElement<E>> = (
    props: MotionProps,
    parent?: VE,
    isStatic?: boolean,
    ref?: Ref<E>
) => VE

export interface ResolvedValues {
    [key: string]: string | number
}
