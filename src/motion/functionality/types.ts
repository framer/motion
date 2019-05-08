import { RefObject, ComponentType, CSSProperties, ReactElement } from "react"
import { MotionProps } from "../types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"

export interface FunctionalProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    innerRef: RefObject<Element | null>
}

export interface FunctionalComponentDefinition {
    shouldRender: (props: MotionProps) => boolean
    component: ComponentType<FunctionalProps>
}

export type UseFunctionalityComponents<P = {}> = (
    props: P & MotionProps,
    values: MotionValuesMap,
    controls: ValueAnimationControls<P>,
    ref: RefObject<Element | null>,
    style: CSSProperties,
    isStatic?: boolean
) => ReactElement<P>[]
