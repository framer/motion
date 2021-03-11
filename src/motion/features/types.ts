import * as React from "react"
import { MotionProps } from "../types"
import { VisualState } from "../utils/use-visual-state"
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

export type RenderComponent<Instance, RenderState> = (
    props: MotionProps,
    ref: React.Ref<Instance>,
    visualState: VisualState<Instance, RenderState>,
    isStatic: boolean
) => any
