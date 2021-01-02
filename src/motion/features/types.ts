import * as React from "react"
import { MotionProps } from "../types"
import { VisualElement } from "../../render/VisualElement"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"

/**
 * @public
 */
export interface FeatureProps extends MotionProps {
    visualElement: HTMLVisualElement
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

export type RenderComponent<P = {}> = (
    Component: string | React.ComponentType<P>,
    props: MotionProps,
    visualElement: VisualElement
) => any
