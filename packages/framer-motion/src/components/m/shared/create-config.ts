import { MotionComponentConfig } from "../../../motion"
import { FeatureComponents } from "../../../motion/features/types"
import { CustomMotionComponentConfig } from "../../../render/dom/motion-proxy"
import { createUseRender, UseVisualProps } from "../../../render/dom/use-render"
import { CreateVisualElement } from "../../../render/types"

export function createDomMotionConfig<Instance, RenderState>(
    baseConfig: Partial<MotionComponentConfig<Instance, RenderState>>,
    useVisualProps: UseVisualProps
) {
    return <Props>(
        Component: string | React.ComponentType<React.PropsWithChildren<Props>>,
        { forwardMotionProps = false }: CustomMotionComponentConfig,
        preloadedFeatures?: FeatureComponents,
        createVisualElement?: CreateVisualElement<any>,
        projectionNodeConstructor?: any
    ) => ({
        ...baseConfig,
        preloadedFeatures,
        useRender: createUseRender(forwardMotionProps, useVisualProps),
        createVisualElement,
        projectionNodeConstructor,
        Component,
    })
}
