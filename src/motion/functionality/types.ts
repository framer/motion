import { ComponentType, CSSProperties, ReactElement } from "react"
import { MotionProps } from "../types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { MotionContextProps } from "../../motion/context/MotionContext"
import { NativeElement } from "motion/utils/use-native-element"

export interface FunctionalProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    nativeElement: NativeElement
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
    nativeElement: NativeElement,
    values: MotionValuesMap,
    props: P & MotionProps,
    parentContext: MotionContextProps,
    controls: ValueAnimationControls<P>,
    inherit: boolean
) => ReactElement<FunctionalProps>[]

export type RenderComponent<P = {}> = (
    nativeElement: NativeElement,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P,
    isStatic?: boolean
) => ReactElement
