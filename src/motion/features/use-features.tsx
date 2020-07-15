import * as React from "react"
import { useContext } from "react"
import { MotionPluginContext } from "../context/MotionPluginContext"
import { VisualElement } from "../../render/VisualElement"
import { MotionProps } from ".."
import { MotionContextProps } from "../context/MotionContext"
import { Drag } from "./drag"
import { Gestures } from "./gestures"
import { Exit } from "./exit"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { getAnimationComponent } from "./animation"
import { AnimateLayout } from "./layout/Animate"
import { MeasureLayout } from "./layout/Measure"

/**
 * Currently we load all features synchronously, but it would be better to offer multiple entry points
 * that allow these to be loaded in asynchronously.
 */
const defaultFeatures = [MeasureLayout, Drag, Gestures, Exit, AnimateLayout]

/**
 * Load features via renderless components based on the provided MotionProps
 */
export function useFeatures(
    isStatic: boolean,
    visualElement: VisualElement,
    controls: VisualElementAnimationControls,
    props: MotionProps,
    context: MotionContextProps,
    parentContext: MotionContextProps,
    shouldInheritVariant: boolean
): null | JSX.Element[] {
    const plugins = useContext(MotionPluginContext)

    // If this is a static component, or we're rendering on the server, we don't load
    // any feature components
    if (isStatic || typeof window === "undefined") return null

    const allFeatures = [...defaultFeatures, ...plugins.features]
    const numFeatures = allFeatures.length
    const features: JSX.Element[] = []

    // TODO: Consolidate Animation feature loading strategy with other functionality components
    const Animation = getAnimationComponent(props)

    if (Animation) {
        features.push(
            <Animation
                key="animation"
                initial={props.initial}
                animate={props.animate}
                variants={props.variants}
                transition={props.transition}
                controls={controls}
                inherit={shouldInheritVariant}
                visualElement={visualElement}
            />
        )
    }

    // Decide which features we should render and add them to the returned array
    for (let i = 0; i < numFeatures; i++) {
        const { shouldRender, key, Component } = allFeatures[i]

        if (shouldRender(props, parentContext)) {
            features.push(
                <Component
                    key={key}
                    {...props}
                    localContext={context}
                    parentContext={parentContext}
                    visualElement={visualElement as any}
                    controls={controls}
                />
            )
        }
    }

    return features
}
