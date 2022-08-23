import React from "react"
import { MotionConfigProps } from "../.."
import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"

interface Props {
    visualElement?: VisualElement
    props: MotionProps & MotionConfigProps
}

export class VisualElementHandler extends React.Component<
    React.PropsWithChildren<Props>
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
