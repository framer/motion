import { MotionProps } from "../../types"
import { FeatureProps, MotionFeature } from "../types"
import React, { useContext } from "react"
import {
    SyncLayoutBatcher,
    SharedLayoutSyncMethods,
    isSharedLayout,
    SharedLayoutContext,
    FramerTreeLayoutContext,
} from "../../../components/AnimateSharedLayout/SharedLayoutContext"

interface SyncProps extends FeatureProps {
    syncLayout: SharedLayoutSyncMethods | SyncLayoutBatcher
    framerSyncLayout: SharedLayoutSyncMethods | SyncLayoutBatcher
}

/**
 * This component is responsible for scheduling the measuring of the motion component
 */
class Measure extends React.Component<SyncProps> {
    /**
     * If this is a child of a SyncContext, register the VisualElement with it on mount.
     */
    componentDidMount() {
        const { syncLayout, framerSyncLayout, visualElement } = this.props
        isSharedLayout(syncLayout) && syncLayout.register(visualElement)
        isSharedLayout(framerSyncLayout) &&
            framerSyncLayout.register(visualElement)
    }

    /**
     * If this is a child of a SyncContext, notify it that it needs to re-render. It will then
     * handle the snapshotting.
     *
     * If it is stand-alone component, add it to the batcher.
     */
    getSnapshotBeforeUpdate() {
        const { syncLayout, visualElement } = this.props

        if (isSharedLayout(syncLayout)) {
            syncLayout.syncUpdate()
        } else {
            visualElement.snapshotBoundingBox()
            syncLayout.add(visualElement)
        }

        return null
    }

    componentDidUpdate() {
        const { syncLayout, visualElement } = this.props

        if (!isSharedLayout(syncLayout)) syncLayout.flush()

        /**
         * If this axis isn't animating as a result of this render we want to reset the targetBox
         * to the measured box
         */
        visualElement.rebaseTargetBox()
    }

    render() {
        return null
    }
}

function MeasureContextProvider(props: FeatureProps) {
    const syncLayout = useContext(SharedLayoutContext)
    const framerSyncLayout = useContext(FramerTreeLayoutContext)
    return (
        <Measure
            {...props}
            syncLayout={syncLayout}
            framerSyncLayout={framerSyncLayout}
        />
    )
}

export const MeasureLayout: MotionFeature = {
    key: "measure-layout",
    shouldRender: (props: MotionProps) =>
        !!props.drag || !!props.layout || !!props.layoutId,
    getComponent: () => MeasureContextProvider,
}
