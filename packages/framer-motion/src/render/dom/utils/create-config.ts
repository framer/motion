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
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
    { forwardMotionProps = false, svg }: CustomMotionComponentConfig,
    preloadedFeatures?: FeatureComponents,
    createVisualElement?: CreateVisualElement<any>,
    projectionNodeConstructor?: any
) {
    const type = svg || isSVGComponent(Component) ? "svg" : "html"
    const baseConfig = type === "svg" ? svgMotionConfig : htmlMotionConfig

    return {
        ...baseConfig,
        type,
        preloadedFeatures,
        useRender: createUseRender(forwardMotionProps),
        createVisualElement,
        projectionNodeConstructor,
        Component,
    } as
        | MotionComponentConfig<SVGElement, SVGRenderState>
        | MotionComponentConfig<HTMLElement, HTMLRenderState>
}
