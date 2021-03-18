import * as React from "react"
import { MotionProps } from "../types"
import { VisualState } from "../utils/use-visual-state"
import { CreateVisualElement, VisualElement } from "../../render/types"

/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    visualElement: VisualElement
}

export type FeatureNames = {
    animation: true
    exit: true
    drag: true
    tap: true
    focus: true
    hover: true
    pan: true
    layoutAnimation: true
    measureLayout: true
}

export type FeatureComponent = React.ComponentType<FeatureProps>

/**
 * @public
 */
export interface FeatureDefinition {
    isEnabled: (props: MotionProps) => boolean
    Component?: FeatureComponent
}

export interface FeatureComponents {
    animation?: FeatureComponent
    exit?: FeatureComponent
    drag?: FeatureComponent
    tap?: FeatureComponent
    focus?: FeatureComponent
    hover?: FeatureComponent
    pan?: FeatureComponent
    layoutAnimation?: FeatureComponent
    measureLayout?: FeatureComponent
}

export interface FeatureBundle extends FeatureComponents {
    renderer: CreateVisualElement<any>
}

export type LazyFeatureBundle = () => Promise<FeatureBundle>

export type FeatureDefinitions = {
    [K in keyof FeatureNames]: FeatureDefinition
}

export type RenderComponent<Instance, RenderState> = (
    Component: string | React.ComponentType,
    props: MotionProps,
    ref: React.Ref<Instance>,
    visualState: VisualState<Instance, RenderState>,
    isStatic: boolean
) => any
