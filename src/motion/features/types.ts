import { ComponentType, CSSProperties, ReactElement } from "react"
import { MotionProps } from "../types"
import { ValueAnimationControls } from "../../animation/ValueAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { MotionContextProps } from "../context/MotionContext"
import { NativeElement } from "../utils/use-native-element"
import { MotionPluginsContext } from "../context/MotionPluginContext"

export interface FeatureProps extends MotionProps {
    controls: ValueAnimationControls
    values: MotionValuesMap
    nativeElement: NativeElement
    localContext: MotionContextProps
    parentContext: MotionContextProps
}

export interface MotionFeature {
    key: string
    shouldRender: (
        props: MotionProps,
        parentContext: MotionContextProps
    ) => boolean
    Component: ComponentType<FeatureProps>
}

export type LoadMotionFeatures<P = {}> = (
    nativeElement: NativeElement,
    values: MotionValuesMap,
    props: P & MotionProps,
    context: MotionContextProps,
    parentContext: MotionContextProps,
    controls: ValueAnimationControls<P>,
    inherit: boolean,
    plugins: MotionPluginsContext
) => ReactElement<FeatureProps>[]

export type RenderComponent<P = {}> = (
    nativeElement: NativeElement,
    style: CSSProperties,
    values: MotionValuesMap,
    props: P,
    isStatic?: boolean
) => ReactElement
