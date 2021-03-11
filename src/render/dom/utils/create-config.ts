import { MotionFeature } from "../../../motion/features/types"
import { isSVGComponent } from "./is-svg-component"
import { MotionComponentConfig } from "../../../motion"
import { createUseRender } from "../use-render"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"
import { svgMotionConfig } from "../../svg/config-motion"
import { htmlMotionConfig } from "../../html/config-motion"

export function createDomMotionConfig<Props>(
    defaultFeatures: MotionFeature[],
    Component: string | React.ComponentType<Props>,
    forwardMotionProps: boolean
) {
    const baseConfig = isSVGComponent(Component)
        ? svgMotionConfig
        : htmlMotionConfig

    return {
        ...baseConfig,
        defaultFeatures,
        useRender: createUseRender(Component, forwardMotionProps),
    } as
        | MotionComponentConfig<SVGElement, SVGRenderState>
        | MotionComponentConfig<HTMLElement, HTMLRenderState>
}
