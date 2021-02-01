import * as React from "react"
import { forwardRef, Ref, useContext } from "react"
import { MotionProps } from "./types"
import { RenderComponent, MotionFeature } from "./features/types"
import { useFeatures } from "./features/use-features"
import { MotionConfigContext } from "./context/MotionConfigContext"
import { MotionContext } from "./context/MotionContext"
import { UseVisualElement } from "../render/types"
export { MotionProps }

export interface MotionComponentConfig<E> {
    defaultFeatures: MotionFeature[]
    useVisualElement: UseVisualElement<E>
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
export function createMotionComponent<P extends {}, E>(
    Component: string | React.ComponentType<P>,
    { defaultFeatures, useVisualElement, useRender }: MotionComponentConfig<E>
) {
    function MotionComponent(props: P & MotionProps, externalRef?: Ref<E>) {
        /**
         * If a component is static, we only visually update it as a
         * result of a React re-render, rather than any interactions or animations.
         * If this component or any ancestor is static, we disable hardware acceleration
         * and don't load any additional functionality.
         */
        const { isStatic } = useContext(MotionConfigContext)

        /**
         * Create a VisualElement for this component. A VisualElement provides a common
         * interface to renderer-specific APIs (ie DOM/Three. js etc) as well as
         * providing a way of rendering to these APIs outside of the React render loop
         * for more performant animations and interactions
         */
        const motionContext = useVisualElement(
            Component,
            props,
            isStatic,
            externalRef
        )
        const visualElement = motionContext.parent!

        /**
         * Load features as renderless components unless the component isStatic
         */
        const features = useFeatures(
            defaultFeatures,
            isStatic,
            visualElement,
            props
        )

        const component = useRender(Component, props, visualElement)

        // The mount order and hierarchy is specific to ensure our element ref is hydrated by the time
        // all plugins and features has to execute.
        return (
            <>
                <MotionContext.Provider value={motionContext}>
                    {component}
                </MotionContext.Provider>
                {features}
            </>
        )
    }

    return forwardRef(MotionComponent)
}
