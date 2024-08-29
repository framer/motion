import * as React from "react"
import { isSVGComponent } from "./is-svg-component"
import { MotionComponentConfig } from "../../../motion"
import { createUseRender } from "../use-render"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"
import { svgMotionConfig } from "../../svg/config-motion"
import { htmlMotionConfig } from "../../html/config-motion"
import { CreateVisualElement } from "../../types"
import { FeaturePackages } from "../../../motion/features/types"

export interface CustomMotionComponentConfig {
    forwardMotionProps?: boolean
}

export function createDomMotionConfig<Props>(
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
    { forwardMotionProps = false }: CustomMotionComponentConfig,
    preloadedFeatures?: FeaturePackages,
    createVisualElement?: CreateVisualElement<any>
) {
    const baseConfig = isSVGComponent(Component)
        ? svgMotionConfig
        : htmlMotionConfig

    return {
        ...baseConfig,
        preloadedFeatures,
        useRender: createUseRender(forwardMotionProps),
        createVisualElement,
        Component,
    } as
        | MotionComponentConfig<SVGElement, SVGRenderState>
        | MotionComponentConfig<HTMLElement, HTMLRenderState>
}
