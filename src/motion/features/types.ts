import * as React from "react"
import { MotionProps } from "../types"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { MotionContextProps } from "../context/MotionContext"
import { MotionPluginsContext } from "../context/MotionPluginContext"
import { VisualElement } from "../../render/VisualElement"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"

/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    visualElement: HTMLVisualElement
    controls: VisualElementAnimationControls
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
    visualElenent: VisualElement,
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
    visualElement: VisualElement
) => any
