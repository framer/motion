import React from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import type { VisualElement } from "../../render/VisualElement"
import { MotionProps } from "../types"

interface Props<Instance> {
    visualElement?: VisualElement<Instance>
    props: MotionProps & Partial<MotionConfigContext>
}

export class VisualElementHandler<Instance> extends React.Component<
    React.PropsWithChildren<Props<Instance>>
> {
    /**
     * Update visual element props as soon as we know this update is going to be commited.
     */
    getSnapshotBeforeUpdate() {
        const { visualElement, props } = this.props
        if (visualElement) visualElement.setProps(props)
        return null
    }

    componentDidUpdate() {}

    render() {
        return this.props.children
    }
}
