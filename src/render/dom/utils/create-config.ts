import { MotionFeature } from "../../../motion/features/types"
import { isSVGComponent } from "./is-svg-component"
import { MotionComponentConfig } from "../../../motion"
import { createUseRender } from "../use-render"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"
import { svgMotionConfig } from "../../svg/config-motion"
import { htmlMotionConfig } from "../../html/config-motion"
import { CreateVisualElement } from "../../types"

export function createDomMotionConfig<Props>(
    defaultFeatures: MotionFeature[],
    Component: string | React.ComponentType<Props>,
    forwardMotionProps: boolean,
    createVisualElement?: CreateVisualElement<any>
) {
    const baseConfig = isSVGComponent(Component)
        ? svgMotionConfig
        : htmlMotionConfig

    return {
        ...baseConfig,
        defaultFeatures,
        useRender: createUseRender(Component, forwardMotionProps),
        createVisualElement,
    } as
        | MotionComponentConfig<SVGElement, SVGRenderState>
        | MotionComponentConfig<HTMLElement, HTMLRenderState>
}
