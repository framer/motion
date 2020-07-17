import { MotionProps } from "../../types"
import { FeatureProps, MotionFeature } from "../types"
import React, { useContext } from "react"
import {
    SyncLayoutBatcher,
    SharedLayoutSyncMethods,
    isSharedLayout,
    SharedLayoutContext,
} from "../../../components/AnimateSharedLayout/SharedLayoutContext"
import { LayoutProps } from "./types"

interface SyncProps extends FeatureProps {
    layout?: LayoutProps["layout"]
    syncLayout: SharedLayoutSyncMethods | SyncLayoutBatcher
}

/**
 * This component is responsible for scheduling the measuring of the motion component
 */
class Measure extends React.Component<SyncProps> {
    constructor(props: SyncProps) {
        super(props)

        /**
         * If this component isn't the child of a SyncContext, make it responsible for flushing
         * the layout batcher
         */
        const { syncLayout } = props
        if (!isSharedLayout(syncLayout)) {
            this.componentDidUpdate = () => syncLayout.flush()
        }
    }

    /**
     * If this is a child of a SyncContext, register the VisualElement with it on mount.
     */
    componentDidMount() {
        const { syncLayout, visualElement } = this.props
        isSharedLayout(syncLayout) && syncLayout.register(visualElement)
    }

    /**
     * If this is a child of a SyncContext, notify it that it needs to re-render. It will then
     * handle the snapshotting.
     *
     * If it is stand-alone component, add it to the batcher.
     */
    getSnapshotBeforeUpdate() {
        const { layout, syncLayout, visualElement } = this.props

        if (isSharedLayout(syncLayout)) {
            syncLayout.syncUpdate()
        } else {
            layout !== "preserve" && visualElement.snapshotBoundingBox()
            syncLayout.add(visualElement)
        }

        return null
    }

    componentDidUpdate() {}

    render() {
        return null
    }
}

export const MeasureLayout: MotionFeature = {
    key: "measure-layout",
    shouldRender: (props: MotionProps) =>
        !!props.drag || !!props.layout || !!props.layoutId,
    Component: (props: FeatureProps) => {
        const syncLayout = useContext(SharedLayoutContext)
        return <Measure {...props} syncLayout={syncLayout} />
    },
}
