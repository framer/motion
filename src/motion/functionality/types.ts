import { ComponentType, CSSProperties, ReactElement, Ref } from "react"
import { MotionProps } from "../types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { MotionContextProps } from "../../motion/context/MotionContext"
import { VisualElement } from "../../dom/VisualElement"

export interface FunctionalProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    visualElement: VisualElement
    localContext: MotionContextProps
    parentContext: MotionContextProps
}

export interface FunctionalComponentDefinition {
    key: string
    shouldRender: (
        props: MotionProps,
        parentContext: MotionContextProps
    ) => boolean
    Component: ComponentType<FunctionalProps>
}

export type LoadFunctionalityComponents<P = {}> = (
    visualElement: VisualElement,
    values: MotionValuesMap,
    props: P & MotionProps,
    context: MotionContextProps,
    parentContext: MotionContextProps,
    controls: ValueAnimationControls<P>,
    inherit: boolean
) => ReactElement<FunctionalProps>[]

export type RenderComponent<P = {}> = (
    ref: Ref<Element>,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P,
    isStatic?: boolean
) => ReactElement
