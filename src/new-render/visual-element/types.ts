import { Ref } from "react"
import { MotionProps } from "../../motion/types"
import { Projection } from "../projection/types"

export interface VisualElement<E = any> {
    addChild(child: VisualElement<unknown>): () => void
    destroy(): void
    style: Projection
    ref: Ref<E>
}

export interface VisualElementOptions<E = any> {
    ref: Ref<E>
    parent?: VisualElement<unknown>
    projectionId?: string
}

export type UseVisualElement<E, P = MotionProps> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps & P,
    isStatic?: boolean,
    ref?: Ref<E>
) => VisualElement
