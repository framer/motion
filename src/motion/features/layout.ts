import React, { useEffect } from "react"
import { HTMLProjectionNode, sync } from "../../projection"
import { FeatureComponents, FeatureProps } from "./types"

class MeasureLayout extends React.Component<FeatureProps> {
    /**
     * This only mounts projection nodes for components that
     * need measuring, we might want to do it for all components
     * in order to incorporate transforms
     */
    componentDidMount() {
        const { visualElement } = this.props
        const { projection } = visualElement
        projection!.setOptions({
            onLayoutUpdate: ({ delta }) => {
                console.log(delta.y)
                projection.setTargetDelta(delta)
            },
            onProjectionUpdate: () => {
                // visualElement.scheduleRender()
                sync.render(() => {
                    Object.assign(
                        visualElement.getInstance().style,
                        projection.getProjectionStyles()
                    )
                })
            },
        })
    }

    getSnapshotBeforeUpdate() {
        this.props.visualElement.projection?.willUpdate()
        return null
    }

    componentDidUpdate() {
        this.props.visualElement.projection?.root!.didUpdate()
    }

    render() {
        const { visualElement } = this.props
        if (!visualElement.projection) {
            console.log(this.props.id)
            const parent = visualElement.parent?.projection
            visualElement.projection = new HTMLProjectionNode(parent)
        }

        return null
    }
}

export const layoutFeatures: FeatureComponents = {
    measureLayout: MeasureLayout,
    layoutAnimation: ({ visualElement, layout, layoutId }) => {
        const { projection } = visualElement

        useEffect(() => {
            if (!(layout || layoutId)) return

            // Add scale correction
            // Add layout update listener to trigger animation

            return () => {
                // Remove layout update listener
            }
        }, [layout, layoutId])

        return null
    },
}
