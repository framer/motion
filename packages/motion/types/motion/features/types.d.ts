import * as React from "react";
import { MotionProps } from "../types";
import { VisualState } from "../utils/use-visual-state";
import { CreateVisualElement, VisualElement } from "../../render/types";
/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    visualElement: VisualElement;
}
export declare type FeatureNames = {
    animation: true;
    exit: true;
    drag: true;
    tap: true;
    focus: true;
    hover: true;
    pan: true;
    inView: true;
    measureLayout: true;
};
export declare type FeatureComponent = React.ComponentType<FeatureProps>;
/**
 * @public
 */
export interface FeatureDefinition {
    isEnabled: (props: MotionProps) => boolean;
    Component?: FeatureComponent;
}
export interface FeatureComponents {
    animation?: FeatureComponent;
    exit?: FeatureComponent;
    drag?: FeatureComponent;
    tap?: FeatureComponent;
    focus?: FeatureComponent;
    hover?: FeatureComponent;
    pan?: FeatureComponent;
    inView?: FeatureComponent;
    measureLayout?: FeatureComponent;
}
export interface FeatureBundle extends FeatureComponents {
    renderer: CreateVisualElement<any>;
    projectionNodeConstructor?: any;
}
export declare type LazyFeatureBundle = () => Promise<FeatureBundle>;
export declare type FeatureDefinitions = {
    [K in keyof FeatureNames]: FeatureDefinition;
};
export declare type LoadedFeatures = FeatureDefinitions & {
    projectionNodeConstructor?: any;
};
export declare type RenderComponent<Instance, RenderState> = (Component: string | React.ComponentType, props: MotionProps, projectionId: number | undefined, ref: React.Ref<Instance>, visualState: VisualState<Instance, RenderState>, isStatic: boolean, visualElement?: VisualElement) => any;
