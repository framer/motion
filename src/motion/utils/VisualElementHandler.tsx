import React from "react"
import { MotionConfigProps } from "../.."
import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"

interface Props {
    visualElement?: VisualElement
    props: MotionProps & MotionConfigProps
}

export class VisualElementHandler extends React.Component<Props> {
    componentDidMount() {
        this.updateProps()
    }

    getSnapshotBeforeUpdate() {
        this.updateProps()
        return null
    }

    componentDidUpdate() {}

    updateProps() {
        const { visualElement, props } = this.props
        if (visualElement) visualElement.setProps(props)
    }

    render() {
        return this.props.children
    }
}
