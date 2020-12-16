import * as React from "react"
import { forwardRef, Ref, useContext, useMemo } from "react"
import { MotionProps } from "./types"
import { useMotionValues } from "./utils/use-motion-values"
import { UseVisualElement } from "../render/VisualElement/types"
import { RenderComponent, MotionFeature } from "./features/types"
import { useFeatures } from "./features/use-features"
import { useSnapshotOnUnmount } from "./features/layout/use-snapshot-on-unmount"
import { useVariants } from "./utils/use-variants"
import { MotionConfigContext } from "./context/MotionConfigContext"
import { MotionContext } from "./context/MotionContext"
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
         * interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
         * providing a way of rendering to these APIs outside of the React render loop
         * for more performant animations and interactions
         */
        const visualElement = useVisualElement(
            Component,
            props,
            isStatic,
            externalRef
        )

        /**
         * Scrape MotionValues from props and add/remove them to/from the VisualElement.
         */
        useMotionValues(visualElement, props)

        /**
         * Add the visualElement as a node in the variant tree.
         */
        const variantContext = useVariants(visualElement, props, isStatic)

        /**
         * Load features as renderless components unless the component isStatic
         */
        const features = useFeatures(
            defaultFeatures,
            isStatic,
            visualElement,
            props
        )

        /**
         * Only create a new context value when the sub-contexts change.
         */
        const context = useMemo(() => ({ visualElement, variantContext }), [
            visualElement,
            variantContext,
        ])

        const component = useRender(Component, props, visualElement)

        /**
         * If this component is a child of AnimateSharedLayout, we need to snapshot the component
         * before it's unmounted. This lives here rather than in features/layout/Measure because
         * as a child component its unmount effect runs after this component has been unmounted.
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
