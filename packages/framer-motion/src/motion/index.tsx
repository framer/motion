import * as React from "react"
import { forwardRef, useContext } from "react"
import { MotionProps } from "./types"
import { RenderComponent, FeatureBundle } from "./features/types"
import { MotionConfigContext } from "../context/MotionConfigContext"
import { MotionContext } from "../context/MotionContext"
import { CreateVisualElement } from "../render/types"
import { useVisualElement } from "./utils/use-visual-element"
import { UseVisualState } from "./utils/use-visual-state"
import { useMotionRef } from "./utils/use-motion-ref"
import { useCreateMotionContext } from "../context/MotionContext/create"
import { featureDefinitions } from "./features/definitions"
import { loadFeatures } from "./features/load-features"
import { isBrowser } from "../utils/is-browser"
import { useProjectionId } from "../projection/node/id"
import { LayoutGroupContext } from "../context/LayoutGroupContext"
import { VisualElementHandler } from "./utils/VisualElementHandler"
import { LazyContext } from "../context/LazyContext"
import { SwitchLayoutGroupContext } from "../context/SwitchLayoutGroupContext"

export interface MotionComponentConfig<Instance, RenderState> {
    preloadedFeatures?: FeatureBundle
    createVisualElement?: CreateVisualElement<Instance>
    projectionNodeConstructor?: any
    useRender: RenderComponent<Instance, RenderState>
    useVisualState: UseVisualState<Instance, RenderState>
    Component: string | React.ComponentType<React.PropsWithChildren<unknown>>
}

/**
 * Create a `motion` component.
 *
 * This function accepts a Component argument, which can be either a string (ie "div"
 * for `motion.div`), or an actual React component.
 *
 * Alongside this is a config option which provides a way of rendering the provided
 * component "offline", or outside the React render cycle.
 */
export function createMotionComponent<Props extends {}, Instance, RenderState>({
    preloadedFeatures,
    createVisualElement,
    projectionNodeConstructor,
    useRender,
    useVisualState,
    Component,
}: MotionComponentConfig<Instance, RenderState>) {
    preloadedFeatures && loadFeatures(preloadedFeatures)

    function MotionComponent(
        props: Props & MotionProps,
        externalRef?: React.Ref<Instance>
    ) {
        const configAndProps = {
            ...useContext(MotionConfigContext),
            ...props,
            layoutId: useLayoutId(props),
        }
        const { isStatic } = configAndProps

        let features: JSX.Element[] | null = null

        const context = useCreateMotionContext(props)

        /**
         * Create a unique projection ID for this component. If a new component is added
         * during a layout animation we'll use this to query the DOM and hydrate its ref early, allowing
         * us to measure it as soon as any layout effect flushes pending layout animations.
         *
         * Performance note: It'd be better not to have to search the DOM for these elements.
         * For newly-entering components it could be enough to only correct treeScale, in which
         * case we could mount in a scale-correction mode. This wouldn't be enough for
         * shared element transitions however. Perhaps for those we could revert to a root node
         * that gets forceRendered and layout animations are triggered on its layout effect.
         */
        const projectionId = isStatic ? undefined : useProjectionId()

        /**
         *
         */
        const visualState = useVisualState(props, isStatic)

        if (!isStatic && isBrowser) {
            /**
             * Create a VisualElement for this component. A VisualElement provides a common
             * interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
             * providing a way of rendering to these APIs outside of the React render loop
             * for more performant animations and interactions
             */
            context.visualElement = useVisualElement(
                Component,
                visualState,
                configAndProps,
                createVisualElement
            )

            /**
             * Load Motion gesture and animation features. These are rendered as renderless
             * components so each feature can optionally make use of React lifecycle methods.
             */
            const lazyStrictMode = useContext(LazyContext).strict
            const initialLayoutGroupConfig = useContext(
                SwitchLayoutGroupContext
            )
            if (context.visualElement) {
                features = context.visualElement.loadFeatures(
                    props,
                    lazyStrictMode,
                    preloadedFeatures,
                    projectionId,
                    projectionNodeConstructor ||
                        featureDefinitions.projectionNodeConstructor,
                    initialLayoutGroupConfig
                )
            }
        }

        /**
         * The mount order and hierarchy is specific to ensure our element ref
         * is hydrated by the time features fire their effects.
         */
        return (
            <VisualElementHandler
                visualElement={context.visualElement}
                props={configAndProps}
            >
                {features}
                <MotionContext.Provider value={context}>
                    {useRender(
                        Component,
                        props,
                        projectionId,
                        useMotionRef(
                            visualState,
                            context.visualElement,
                            externalRef
                        ),
                        visualState,
                        isStatic,
                        context.visualElement
                    )}
                </MotionContext.Provider>
            </VisualElementHandler>
        )
    }

    return forwardRef(MotionComponent)
}

function useLayoutId({ layoutId }: MotionProps) {
    const layoutGroupId = useContext(LayoutGroupContext).id
    return layoutGroupId && layoutId !== undefined
        ? layoutGroupId + "-" + layoutId
        : layoutId
}
