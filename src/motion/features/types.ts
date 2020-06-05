import * as React from "react"
import { MotionProps } from "../types"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { MotionValuesMap } from "../utils/use-motion-values"
import { MotionContextProps } from "../context/MotionContext"
import { NativeElement } from "../utils/use-native-element"
import { MotionPluginsContext } from "../context/MotionPluginContext"
import { VisualElement } from "../../render/VisualElement"

/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    controls: VisualElementAnimationControls
    values: MotionValuesMap
    nativeElement: NativeElement
    localContext: MotionContextProps
    parentContext: MotionContextProps
}

/**
 * @public
 */
export interface MotionFeature {
    key: string
    shouldRender: (
        props: MotionProps,
        parentContext: MotionContextProps
    ) => boolean
    Component: React.ComponentType<FeatureProps>
}

export type LoadMotionFeatures<P = {}> = (
    nativeElement: NativeElement,
    values: MotionValuesMap,
    props: P & MotionProps,
    context: MotionContextProps,
    parentContext: MotionContextProps,
    controls: VisualElementAnimationControls<P>,
    inherit: boolean,
    plugins: MotionPluginsContext
) => React.ReactElement<FeatureProps>[]

export type RenderComponent<P = {}> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps,
    visualElement: VisualElement<any>
) => any
