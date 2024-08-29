import { createRendererMotionComponent } from "../../../motion"
import { animations } from "../../../motion/features/animations"
import { drag } from "../../../motion/features/drag"
import { gestureAnimations } from "../../../motion/features/gestures"
import { layout } from "../../../motion/features/layout"
import { FeaturePackages } from "../../../motion/features/types"
import { MotionProps } from "../../../motion/types"
import { createDomVisualElement } from "../../dom/create-visual-element"
import { createDomMotionConfig } from "../../dom/utils/create-config"
import { HTMLRenderState } from "../../html/types"
import { SVGRenderState } from "../../svg/types"

export type CustomDomComponent<Props> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props & MotionProps> &
        React.RefAttributes<SVGElement | HTMLElement>
>

const preloadedFeatures: FeaturePackages = {
    ...animations,
    ...gestureAnimations,
    ...drag,
    ...layout,
}

export function createMotionComponent<
    Props extends {},
    Instance = HTMLElement | SVGElement,
    RenderState = HTMLRenderState | SVGRenderState
>(
    Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
    options = { forwardMotionProps: false }
) {
    const config = createDomMotionConfig(
        Component,
        options,
        preloadedFeatures,
        createDomVisualElement
    )

    return createRendererMotionComponent<Props, Instance, RenderState>(
        config as any
    )
}
