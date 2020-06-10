import * as React from "react"
import { useContext } from "react"
import { MotionPluginContext } from "../context/MotionPluginContext"
import { VisualElement } from "../../render/VisualElement"
import { MotionProps } from ".."
import { MotionContextProps } from "../context/MotionContext"
import { Auto } from "./auto"
import { Drag } from "./drag"
import { Gestures } from "./gestures"
import { Exit } from "./exit"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { getAnimationComponent } from "./animation"

/**
 * TODO: Provide the option to load these dynamically.
 */
const defaultFeatures = [Auto, Drag, Gestures, Exit]

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
