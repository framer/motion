import * as React from "react"
import { forwardRef, Ref, useContext } from "react"
import { MotionProps } from "./types"
import { RenderComponent, MotionFeature } from "./features/types"
import { useFeatures } from "./features/use-features"
import { MotionConfigContext } from "./context/MotionConfigContext"
import { MotionContext, useCreateMotionContext } from "./context/MotionContext"
import { CreateVisualElement } from "../render/types"
import { useVisualElement } from "./utils/use-visual-element"
import { useCreateVisualState } from "./utils/use-create-visual-state"
export { MotionProps }

export interface MotionComponentConfig<E> {
    defaultFeatures: MotionFeature[]
    createVisualElement: CreateVisualElement<E>
    useRender: RenderComponent
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
export function createMotionComponent<P extends {}, E>({
    defaultFeatures,
    createVisualElement,
    useRender,
}: MotionComponentConfig<E>) {
    function MotionComponent(props: P & MotionProps, externalRef?: Ref<E>) {
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
        const visualState = useCreateVisualState(props, isStatic)

        if (!isStatic && typeof window !== "undefined") {
            /**
             * Create a VisualElement for this component. A VisualElement provides a common
             * interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
             * providing a way of rendering to these APIs outside of the React render loop
             * for more performant animations and interactions
             */
            context.visualElement = useVisualElement(
                visualState,
                createVisualElement,
                props,
                externalRef
            )

            /**
             * Load Motion gesture and animation features. These are rendered as renderless
             * components so each feature can optionally make use of React lifecycle methods.
             *
             * TODO: The intention is to move these away from a React-centric to a
             * VisualElement-centric lifecycle scheme.
             */
            features = useFeatures(
                defaultFeatures,
                context.visualElement,
                props
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
                        props,
                        visualState,
                        isStatic,
                        context.visualElement
                    )}
                </MotionContext.Provider>
                {features}
            </>
        )
    }

    return forwardRef(MotionComponent)
}
