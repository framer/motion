import React, { useContext } from "react"
import { usePresence } from "../../../components/AnimatePresence/use-presence"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../../context/LayoutGroupContext"
import {
    PromoteGroupContext,
    PromoteGroupContextProps,
} from "../../../context/PromoteContext"
import { correctBorderRadius } from "../../../projection/styles/scale-border-radius"
import { correctBoxShadow } from "../../../projection/styles/scale-box-shadow"
import { addScaleCorrector } from "../../../projection/styles/scale-correction"
import { FeatureProps } from "../types"

interface MeasureContextProps {
    layoutGroup: LayoutGroupContextProps
    promoteGroup: PromoteGroupContextProps
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
        const { visualElement, layoutGroup } = this.props
        const { projection } = visualElement

        addScaleCorrector(defaultScaleCorrectors)

        const { group } = layoutGroup
        if (group && projection) group.add(projection)

        this.props.visualElement.projection?.root!.didUpdate()
    }

    getSnapshotBeforeUpdate(prevProps: FeatureProps & MeasureContextProps) {
        const {
            layoutDependency,
            visualElement,
            drag,
            promoteGroup,
            isPresent,
        } = this.props
        const projection = visualElement.projection!

        if (
            drag ||
            prevProps.layoutDependency !== layoutDependency ||
            layoutDependency === undefined
        ) {
            projection.willUpdate()
        }

        if (promoteGroup.isPromoted !== undefined) {
            if (promoteGroup.isPromoted && !prevProps.promoteGroup.isPromoted) {
                projection.promote()
            }
        } else if (prevProps.isPresent !== isPresent) {
            isPresent ? projection.promote() : projection.relegate()
        }

        return null
    }

    componentDidUpdate() {
        this.props.visualElement.projection?.root!.didUpdate()
    }

    componentWillUnmount() {
        const { visualElement, layoutGroup } = this.props
        const { group } = layoutGroup
        if (group && visualElement.projection)
            group.remove(visualElement.projection)
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
            promoteGroup={useContext(PromoteGroupContext)}
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
