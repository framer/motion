import * as React from "react";
import { FeatureComponents } from "../../../motion/features/types";
import { MotionComponentConfig } from "../../../motion";
import { HTMLRenderState } from "../../html/types";
import { SVGRenderState } from "../../svg/types";
import { CreateVisualElement } from "../../types";
import { CustomMotionComponentConfig } from "../motion-proxy";
export declare function createDomMotionConfig<Props>(Component: string | React.ComponentType<Props>, { forwardMotionProps }: CustomMotionComponentConfig, preloadedFeatures?: FeatureComponents, createVisualElement?: CreateVisualElement<any>, projectionNodeConstructor?: any): MotionComponentConfig<SVGElement, SVGRenderState> | MotionComponentConfig<HTMLElement, HTMLRenderState>;
