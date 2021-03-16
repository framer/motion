import * as React from "react"
import { MotionProps } from "../types"
import { VisualState } from "../utils/use-visual-state"
import { VisualElement } from "../../render/types"

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

export interface FeatureBundle {
    [key: string]: FeatureComponent
}

export type LazyFeatureBundle = () => Promise<FeatureBundle>

export type FeatureDefinitions = {
    [K in keyof FeatureNames]: FeatureDefinition
}

export type RenderComponent<Instance, RenderState> = (
    props: MotionProps,
    ref: React.Ref<Instance>,
    visualState: VisualState<Instance, RenderState>,
    isStatic: boolean
) => any
