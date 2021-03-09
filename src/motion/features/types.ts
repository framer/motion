import * as React from "react"
import { MotionProps } from "../types"
import { ResolvedValues, VisualElement } from "../../render/types"

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
    visualState: ResolvedValues,
    visualElement?: VisualElement
) => any
