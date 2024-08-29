import { createRendererMotionComponent } from "../../../motion"
import { createDomMotionConfig } from "../../dom/utils/create-config"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"

export function createMinimalMotionComponent<
    Props extends {},
    Instance = HTMLElement | SVGElement,
    RenderState = HTMLRenderState | SVGRenderState
>(
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
    options = { forwardMotionProps: false }
) {
    const config = createDomMotionConfig(Component, options)

    return createRendererMotionComponent<Props, Instance, RenderState>(
        config as any
    )
}
