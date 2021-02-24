import * as React from "react"
import { MotionProps } from "../types"
import { VisualElement } from "../../render/types"

/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    visualElement: VisualElement
}

/**
 * @public
 */
export interface MotionFeature {
    key: string
    shouldRender: (props: MotionProps) => boolean
    getComponent: (
        props: MotionProps
    ) => React.ComponentType<FeatureProps> | undefined
}

export type RenderComponent = (
    props: MotionProps,
    visualElement: VisualElement
) => any
