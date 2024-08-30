import {
    createRendererMotionComponent,
    MotionComponentProps,
} from "../../motion"
import { DOMMotionComponents } from "../dom/types"
import { CreateVisualElement } from "../types"
import { FeaturePackages } from "../../motion/features/types"
import { isSVGComponent } from "../dom/utils/is-svg-component"
import { svgMotionConfig } from "../svg/config-motion"
import { htmlMotionConfig } from "../html/config-motion"
import { createUseRender } from "../dom/use-render"

type MotionComponent<T, P> = T extends keyof DOMMotionComponents
    ? DOMMotionComponents[T]
    : React.ForwardRefExoticComponent<
          MotionComponentProps<React.PropsWithChildren<P>>
      >

export function createMotionComponentFactory(
    features?: FeaturePackages,
    createVisualElement?: CreateVisualElement<any>
) {
    return function createMotionComponent<
        Props,
        TagName extends keyof DOMMotionComponents | string = "div"
    >(
        Component: TagName | string | React.ForwardRefExoticComponent<Props>,
        options = { forwardMotionProps: false }
    ) {
        const baseConfig = isSVGComponent(Component)
            ? svgMotionConfig
            : htmlMotionConfig

        const config = {
            ...baseConfig,
            features,
            useRender: createUseRender(options.forwardMotionProps),
            createVisualElement,
            Component,
        }

        return createRendererMotionComponent(config as any) as MotionComponent<
            TagName,
            Props
        >
    }
}
