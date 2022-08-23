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
import { useSVGProps } from "../../svg/use-props"
import { useHTMLProps } from "../../html/use-props"

export function createDomMotionConfig<Props>(
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
    { forwardMotionProps = false }: CustomMotionComponentConfig,
    preloadedFeatures?: FeatureComponents,
    createVisualElement?: CreateVisualElement<any>,
    projectionNodeConstructor?: any
) {
    const baseConfig = isSVGComponent(Component)
        ? svgMotionConfig
        : htmlMotionConfig

    const useVisualProps = isSVGComponent(Component)
        ? useSVGProps
        : useHTMLProps

    return {
        ...baseConfig,
        preloadedFeatures,
        useRender: createUseRender(forwardMotionProps, useVisualProps),
        createVisualElement,
        projectionNodeConstructor,
        Component,
    } as
        | MotionComponentConfig<SVGElement, SVGRenderState>
        | MotionComponentConfig<HTMLElement, HTMLRenderState>
}
