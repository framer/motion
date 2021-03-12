import * as React from "react"
import { useContext } from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { VisualElement } from "../../render/types"
import { MotionProps } from ".."
import { MotionFeature } from "./types"

/**
 * Load features via renderless components based on the provided MotionProps.
 * TODO: Look into porting this to a component-less appraoch.
 */
export function useFeatures(
    defaultFeatures: MotionFeature[],
    visualElement: VisualElement,
    props: MotionProps
): null | JSX.Element[] {
    const plugins = useContext(MotionConfigContext)

    const allFeatures = [...defaultFeatures, ...plugins.features]
    const numFeatures = allFeatures.length
    const features: JSX.Element[] = []

    // Decide which features we should render and add them to the returned array
    for (let i = 0; i < numFeatures; i++) {
        const { shouldRender, key, getComponent } = allFeatures[i]

        if (shouldRender(props)) {
            const Component = getComponent(props)
            Component &&
                features.push(
                    <Component
                        key={key}
                        {...props}
                        visualElement={visualElement as any}
                    />
                )
        }
    }

    return features
}
