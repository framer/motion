import { MotionProps } from "../../types"
import { FeatureProps, MotionFeature } from "../types"
import React, { useContext } from "react"
import { SyncContext } from "./SyncContext"

class Measure extends React.Component<FeatureProps> {
    getSnapshotBeforeUpdate() {
        const { syncLayout, visualElement } = this.props
        syncLayout.add(visualElement)
    }

    componentDidUpdate() {
        const { syncLayout } = this.props
        syncLayout.flush()
    }

    render() {
        return null
    }
}

export const MeasureLayout: MotionFeature = {
    key: "measure-layout",
    shouldRender: (props: MotionProps) => !!props.drag || !!props.layout,
    Component: (props: FeatureProps) => {
        const syncLayout = useContext(SyncContext)
        return <Measure {...props} syncLayout={syncLayout} />
    },
}
