import * as React from "react"
import { useContext } from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { VisualElement } from "../../render/types"
import { MotionProps } from ".."
import { FeatureDefinition } from "./types"
import { featureDefinitions } from "./definitions"

const featureNames = Object.keys(featureDefinitions)
const numFeatures = featureNames.length

/**
 * Load features via renderless components based on the provided MotionProps.
 * TODO: Look into porting this to a component-less appraoch.
 */
export function useFeatures(
    props: MotionProps,
    visualElement?: VisualElement
): null | JSX.Element[] {
    const features: JSX.Element[] = []
    const config = useContext(MotionConfigContext)

    if (!visualElement) return null

    for (let i = 0; i < numFeatures; i++) {
        const name = featureNames[i]
        const { isEnabled, Component } = featureDefinitions[
            name
        ] as FeatureDefinition

        if (isEnabled(props)) {
            if (Component) {
                features.push(
                    <Component
                        key={name}
                        {...props}
                        visualElement={visualElement}
                    />
                )
            } else {
                // TODO: Lazy load
                // TODO: Warn if no lazy load definition or null found
            }
        }
    }

    return features
}
