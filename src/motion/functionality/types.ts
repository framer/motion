import { RefObject, ComponentType, CSSProperties, ReactElement } from "react"
import { MotionProps } from "../types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"

export interface FunctionalProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    innerRef: RefObject<Element>
}

export interface FunctionalComponentDefinition {
    shouldRender: (props: MotionProps) => boolean
    component: ComponentType<FunctionalProps>
}

export type UseFunctionalityComponents<P = {}> = (
    ref: RefObject<Element>,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P & MotionProps,
    controls: ValueAnimationControls<P>,
    isStatic?: boolean
) => ReactElement<FunctionalProps>[]

export type UseRenderComponent<P = {}> = (
    ref: RefObject<Element>,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P,
    isStatic?: boolean
) => ReactElement
