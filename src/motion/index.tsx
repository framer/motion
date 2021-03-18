import * as React from "react"
import { forwardRef, useContext } from "react"
import { MotionProps } from "./types"
import { RenderComponent, FeatureBundle } from "./features/types"
import { useFeatures } from "./features/use-features"
import { MotionConfigContext } from "../context/MotionConfigContext"
import { MotionContext } from "../context/MotionContext"
import { CreateVisualElement } from "../render/types"
import { useVisualElement } from "./utils/use-visual-element"
import { UseVisualState } from "./utils/use-visual-state"
import { useMotionRef } from "./utils/use-motion-ref"
import { useCreateMotionContext } from "../context/MotionContext/create"
import { loadFeatures } from "./features/definitions"
import { isBrowser } from "../utils/is-browser"
export { MotionProps }

export interface MotionComponentConfig<Instance, RenderState> {
    preloadedFeatures?: FeatureBundle
    createVisualElement?: CreateVisualElement<Instance>
    useRender: RenderComponent<Instance, RenderState>
    useVisualState: UseVisualState<Instance, RenderState>
    Component: string | React.ComponentType
}

/**
 * Create a `motion` component.
 *
 * This function accepts a Component argument, which can be either a string (ie "div"
 * for `motion.div`), or an actual React component.
 *
 * Alongside this is a config option which provides a way of rendering the provided
 * component "offline", or outside the React render cycle.
 *
 * @internal
 */
export function createMotionComponent<Props extends {}, Instance, RenderState>({
    preloadedFeatures,
    createVisualElement,
    useRender,
    useVisualState,
    Component,
}: MotionComponentConfig<Instance, RenderState>) {
    preloadedFeatures && loadFeatures(preloadedFeatures)

    function MotionComponent(
        props: Props & MotionProps,
        externalRef?: React.Ref<Instance>
    ) {
        /**
         * If we're rendering in a static environment, we only visually update the component
         * as a result of a React-rerender rather than interactions or animations. This
         * means we don't need to load additional memory structures like VisualElement,
         * or any gesture/animation features.
         */
        const { isStatic } = useContext(MotionConfigContext)

        let features: JSX.Element[] | null = null

        /**
         * Create the tree context. This is memoized and will only trigger renders
         * when the current tree variant changes in static mode.
         */
        const context = useCreateMotionContext(props, isStatic)

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
                props,
                createVisualElement
            )

            /**
             * Load Motion gesture and animation features. These are rendered as renderless
             * components so each feature can optionally make use of React lifecycle methods.
             *
             * TODO: The intention is to move these away from a React-centric to a
             * VisualElement-centric lifecycle scheme.
             */
            features = useFeatures(
                props,
                context.visualElement,
                preloadedFeatures
            )
        }

        /**
         * The mount order and hierarchy is specific to ensure our element ref
         * is hydrated by the time features fire their effects.
         */
        return (
            <>
                <MotionContext.Provider value={context}>
                    {useRender(
                        Component,
                        props,
                        useMotionRef(
                            visualState,
                            context.visualElement,
                            externalRef
                        ),
                        visualState,
                        isStatic
                    )}
                </MotionContext.Provider>
                {features}
            </>
        )
    }

    return forwardRef(MotionComponent)
}
