import * as React from "react"
import { useContext, forwardRef, Ref } from "react"
import { MotionContext, useMotionContext } from "./context/MotionContext"
import { MotionProps } from "./types"
import { checkShouldInheritVariant } from "./utils/should-inherit-variant"
import { useMotionValues } from "./utils/use-motion-values"
import { UseVisualElement } from "../render/types"
import { RenderComponent } from "./features/types"
import { AnimationControlsConfig } from "../animation/VisualElementAnimationControls"
import { useVisualElementAnimation } from "../animation/use-visual-element-animation"
import { useFeatures } from "./features/use-features"
import { useSnapshotOnUnmount } from "./features/layout/use-snapshot-on-unmount"
export { MotionProps }

export interface MotionComponentConfig<E> {
    useVisualElement: UseVisualElement<E>
    render: RenderComponent
    animationControlsConfig: AnimationControlsConfig
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
    {
        useVisualElement,
        render,
        animationControlsConfig,
    }: MotionComponentConfig<E>
) {
    function MotionComponent(props: P & MotionProps, externalRef?: Ref<E>) {
        const parentContext = useContext(MotionContext)
        const shouldInheritVariant = checkShouldInheritVariant(props)

        /**
         * If a component isStatic, we only visually update it as a
         * result of a React re-render, rather than any interactions or animations.
         * If this component or any ancestor isStatic, we disable hardware acceleration
         * and don't load any additional functionality.
         */
        const isStatic = parentContext.static || props.static || false

        /**
         * Create a VisualElement for this component. A VisualElement provides a common
         * interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
         * providing a way of rendering to these APIs outside of the React render loop
         * for more performant animations and interactions
         */
        const visualElement = useVisualElement(
            Component,
            props,
            parentContext.visualElement as any,
            isStatic,
            externalRef
        )

        /**
         * Scrape MotionValues from props and add/remove them to/from
         * the VisualElement as necessary.
         */
        useMotionValues(visualElement, props)

        /**
         * Create animation controls for the VisualElement. It might be
         * interesting to try and combine this with VisualElement itself in a further refactor.
         */
        const controls = useVisualElementAnimation(
            visualElement,
            props,
            animationControlsConfig
        )

        /**
         * Build the MotionContext to pass on to the next `motion` component.
         */
        const context = useMotionContext(
            parentContext,
            controls,
            visualElement,
            isStatic,
            props
        )

        /**
         * Load features as renderless components unless the component isStatic
         */
        const features = useFeatures(
            isStatic,
            visualElement,
            controls,
            props,
            context,
            parentContext,
            shouldInheritVariant
        )

        const component = render(Component, props, visualElement)

        /**
         *
         */
        useSnapshotOnUnmount(visualElement)

        // The mount order and hierarchy is specific to ensure our element ref is hydrated by the time
        // all plugins and features has to execute.
        return (
            <>
                <MotionContext.Provider value={context}>
                    {component}
                </MotionContext.Provider>
                {features}
            </>
        )
    }

    return forwardRef(MotionComponent)
}
