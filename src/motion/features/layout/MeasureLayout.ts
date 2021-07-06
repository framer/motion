import React from "react"
import { LayoutGroupContext } from "../../../context/LayoutGroupContext"
import { HTMLProjectionNode } from "../../../projection"
import { correctBorderRadius } from "../../../projection/styles/scale-border-radius"
import { correctBoxShadow } from "../../../projection/styles/scale-box-shadow"
import { addScaleCorrector } from "../../../projection/styles/scale-correction"
import { FeatureProps } from "../types"

export class MeasureLayout extends React.Component<FeatureProps> {
    static contextType = LayoutGroupContext

    /**
     * This only mounts projection nodes for components that
     * need measuring, we might want to do it for all components
     * in order to incorporate transforms
     */
    componentDidMount() {
        const { visualElement, layout, layoutId } = this.props
        const { projection } = visualElement

        addScaleCorrector(defaultScaleCorrectors)

        const { group } = this.context
        if (group) group.add(projection)

        this.props.visualElement.projection?.root!.didUpdate()
    }

    getSnapshotBeforeUpdate(prevProps: FeatureProps) {
        const { layoutDependency, visualElement } = this.props
        if (
            prevProps.layoutDependency !== layoutDependency ||
            layoutDependency === undefined
        ) {
            visualElement.projection?.willUpdate()
        }
        return null
    }

    componentDidUpdate() {
        this.props.visualElement.projection?.root!.didUpdate()
    }

    componentWillUnmount() {
        const { group } = this.context
        if (group) group.remove(this.props.visualElement.projection)
    }

    render() {
        const { visualElement, layoutId, layout } = this.props
        if (!visualElement.projection) {
            // TODO do this on construction
            const parent = visualElement.parent?.projection

            visualElement.projection = new HTMLProjectionNode(
                this.props.projectionId,
                visualElement.getLatestValues(),
                parent
            )

            visualElement.projection.setOptions({
                layoutId,
                layout,
                visualElement,
                onProjectionUpdate: () => visualElement.scheduleRender(),
                animationType: typeof layout === "string" ? layout : "both",
            })
        }

        return null
    }
}

const defaultScaleCorrectors = {
    borderRadius: {
        ...correctBorderRadius,
        applyTo: [
            "borderTopLeftRadius",
            "borderTopRightRadius",
            "borderBottomLeftRadius",
            "borderBottomRightRadius",
        ],
    },
    borderTopLeftRadius: correctBorderRadius,
    borderTopRightRadius: correctBorderRadius,
    borderBottomLeftRadius: correctBorderRadius,
    borderBottomRightRadius: correctBorderRadius,
    boxShadow: correctBoxShadow,
}
