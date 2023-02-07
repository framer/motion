import * as React from "react"
import { MotionProps } from "../types"
import { VisualState } from "../utils/use-visual-state"
import { VisualElement } from "../../render/VisualElement"
import { CreateVisualElement } from "../../render/types"

/**
 * @public
 */
export interface FeatureProps<T = unknown> extends MotionProps {
    visualElement: VisualElement<T>
}

export type FeatureNames = {
    animation: true
    exit: true
    drag: true
    tap: true
    focus: true
    hover: true
    pan: true
    inView: true
    measureLayout: true
}

export type FeatureComponent = React.ComponentType<
    React.PropsWithChildren<FeatureProps>
>

export type Feature = (visualElement: VisualElement<any>) => VoidFunction

export interface ReactFeatureDefinition {
    type?: "react"
    feature?: FeatureComponent
}

export interface VanillaFeatureDefinition {
    type?: "vanilla"
    feature?: Feature
}

/**
 * @public
 */
export type FeatureDefinition = {
    isEnabled: (props: MotionProps) => boolean
} & (ReactFeatureDefinition | VanillaFeatureDefinition)

export interface FeatureComponents {
    animation?: ReactFeatureDefinition
    exit?: ReactFeatureDefinition
    drag?: ReactFeatureDefinition
    tap?: ReactFeatureDefinition
    focus?: VanillaFeatureDefinition
    hover?: VanillaFeatureDefinition
    pan?: ReactFeatureDefinition
    inView?: ReactFeatureDefinition
    measureLayout?: ReactFeatureDefinition
}

export interface FeatureBundle extends FeatureComponents {
    renderer: CreateVisualElement<any>
    projectionNodeConstructor?: any
}

export type LazyFeatureBundle = () => Promise<FeatureBundle>

export type FeatureDefinitions = {
    [K in keyof FeatureNames]: FeatureDefinition
}

export type LoadedFeatures = FeatureDefinitions & {
    projectionNodeConstructor?: any
}

export type RenderComponent<Instance, RenderState> = (
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>,
    props: MotionProps,
    projectionId: number | undefined,
    ref: React.Ref<Instance>,
    visualState: VisualState<Instance, RenderState>,
    isStatic: boolean,
    visualElement?: VisualElement<Instance>
) => any
