import { RefObject, ComponentType, CSSProperties } from "react"
import { MotionProps } from "../types"
import { ComponentAnimationControls } from "../../animation/ComponentAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"

export type FunctionalProps = MotionProps & {
    controls: ComponentAnimationControls
    values: MotionValuesMap
    innerRef: RefObject<Element | null>
}

export interface FunctionalComponentDefinition {
    test: (props: MotionProps) => boolean
    component: ComponentType<FunctionalProps>
}

export type GetFunctionalityComponents<P = {}> = (
    props: P & MotionProps,
    values: MotionValuesMap,
    controls: ComponentAnimationControls<P>,
    ref: RefObject<Element | null>,
    style: CSSProperties,
    isStatic?: boolean
) => ComponentType<FunctionalProps>[]
