import React, { useContext } from "react"
import { usePresence } from "../../../components/AnimatePresence/use-presence"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../../context/LayoutGroupContext"
import { PromoteGroupContext } from "../../../context/PromoteContext"
import { correctBorderRadius } from "../../../projection/styles/scale-border-radius"
import { correctBoxShadow } from "../../../projection/styles/scale-box-shadow"
import { addScaleCorrector } from "../../../projection/styles/scale-correction"
import { FeatureProps } from "../types"

interface MeasureContextProps {
    layoutGroup: LayoutGroupContextProps
    promoteContext: PromoteGroupContext
    isPresent: boolean
    safeToRemove?: VoidFunction | null
}

class MeasureLayoutWithContext extends React.Component<
    FeatureProps & MeasureContextProps
> {
    /**
     * This only mounts projection nodes for components that
     * need measuring, we might want to do it for all components
     * in order to incorporate transforms
     */
    componentDidMount() {
        const { visualElement, layoutGroup, promoteContext } = this.props
        const { projection } = visualElement

        addScaleCorrector(defaultScaleCorrectors)

        if (projection) {
            if (layoutGroup.group) layoutGroup.group.add(projection)
            if (promoteContext.group && projection.options.layoutId) {
                promoteContext.group.add(projection)
            }
        }

        projection?.root!.didUpdate()
        projection?.onAnimationComplete(() => this.safeToRemove())
    }

    getSnapshotBeforeUpdate(prevProps: FeatureProps & MeasureContextProps) {
        const { layoutDependency, visualElement, drag, isPresent } = this.props
        const projection = visualElement.projection!

        if (
            drag ||
            prevProps.layoutDependency !== layoutDependency ||
            layoutDependency === undefined
        ) {
            projection.willUpdate()
        }

        if (prevProps.isPresent !== isPresent) {
            if (isPresent) {
                projection.promote()
            } else {
                const foundPrevNode = projection.relegate()
                if (!foundPrevNode) this.safeToRemove()
            }
        }

        return null
    }

    componentDidUpdate() {
        this.props.visualElement.projection?.root!.didUpdate()
    }

    componentWillUnmount() {
        const { visualElement, layoutGroup, promoteContext } = this.props
        const { projection } = visualElement

        if (projection) {
            if (layoutGroup.group) layoutGroup.group.remove(projection)
            if (promoteContext.group) promoteContext.group.delete(projection)
        }
    }

    safeToRemove() {
        console.log("safe to remove")
        this.props.safeToRemove?.()
    }

    render() {
        return null
    }
}

export function MeasureLayout(props: FeatureProps) {
    const [isPresent, safeToRemove] = usePresence()
    return (
        <MeasureLayoutWithContext
            {...props}
            layoutGroup={useContext(LayoutGroupContext)}
            promoteContext={useContext(PromoteGroupContext)}
            isPresent={isPresent}
            safeToRemove={safeToRemove}
        />
    )
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
