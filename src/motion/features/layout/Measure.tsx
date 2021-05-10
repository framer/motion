import { FeatureProps } from "../types"
import React, { useContext } from "react"
import {
    isSharedLayout,
    SharedLayoutContext,
    FramerTreeLayoutContext,
} from "../../../context/SharedLayoutContext"
import {
    SharedLayoutSyncMethods,
    SyncLayoutBatcher,
} from "../../../components/AnimateSharedLayout/types"
import { snapshotViewportBox } from "../../../render/dom/projection/utils"

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

        visualElement.onUnmount(() => {
            if (isSharedLayout(syncLayout)) {
                syncLayout.remove(visualElement as any)
            }

            if (isSharedLayout(framerSyncLayout)) {
                framerSyncLayout.remove(visualElement as any)
            }
        })
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
            snapshotViewportBox(visualElement)
            syncLayout.add(visualElement)
        }

        return null
    }

    componentDidUpdate() {
        const { syncLayout } = this.props

        if (!isSharedLayout(syncLayout)) syncLayout.flush()
    }

    render() {
        return null
    }
}

export function MeasureContextProvider(props: FeatureProps) {
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
