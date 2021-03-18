import * as React from "react"
import { FeatureComponents } from "../../../motion/features/types"
import { isSVGComponent } from "./is-svg-component"
import { MotionComponentConfig } from "../../../motion"
import { createUseRender } from "../use-render"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"
import { svgMotionConfig } from "../../svg/config-motion"
import { htmlMotionConfig } from "../../html/config-motion"
import { CreateVisualElement } from "../../types"
import { CustomMotionComponentConfig } from "../motion-proxy"

export function createDomMotionConfig<Props>(
    Component: string | React.ComponentType<Props>,
    { forwardMotionProps = false }: CustomMotionComponentConfig,
    preloadedFeatures?: FeatureComponents,
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
