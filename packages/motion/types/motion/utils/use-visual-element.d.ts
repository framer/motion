import * as React from "react";
import { MotionProps } from "../../motion/types";
import { CreateVisualElement, VisualElement } from "../../render/types";
import { VisualState } from "./use-visual-state";
import { MotionConfigProps } from "../../components/MotionConfig";
export declare function useVisualElement<Instance, RenderState>(Component: string | React.ComponentType, visualState: VisualState<Instance, RenderState>, props: MotionProps & MotionConfigProps, createVisualElement?: CreateVisualElement<Instance>): VisualElement<Instance> | undefined;
