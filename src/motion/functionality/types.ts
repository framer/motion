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
    key: string
    shouldRender: (props: MotionProps) => boolean
    Component: ComponentType<FunctionalProps>
}

export type LoadFunctionalityComponents<P = {}> = (
    ref: RefObject<Element>,
    values: MotionValuesMap,
    props: P & MotionProps,
    controls: ValueAnimationControls<P>,
    inherit: boolean
) => ReactElement<FunctionalProps>[]

export type RenderComponent<P = {}> = (
    ref: RefObject<Element>,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P,
    isStatic?: boolean
) => ReactElement
