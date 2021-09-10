import React, { useContext } from "react"
import { usePresence } from "../../../components/AnimatePresence/use-presence"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../../context/LayoutGroupContext"
import { SwitchLayoutGroupContext } from "../../../context/SwitchLayoutGroupContext"
import { globalProjectionState } from "../../../projection/node/create-projection-node"
import { correctBorderRadius } from "../../../projection/styles/scale-border-radius"
import { correctBoxShadow } from "../../../projection/styles/scale-box-shadow"
import { addScaleCorrector } from "../../../projection/styles/scale-correction"
import { FeatureProps } from "../types"

interface MeasureContextProps {
    layoutGroup?: LayoutGroupContextProps
    switchLayoutGroup?: SwitchLayoutGroupContext
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
        const {
            visualElement,
            layoutGroup,
            switchLayoutGroup,
            layoutId,
        } = this.props
        const { projection } = visualElement

        addScaleCorrector(defaultScaleCorrectors)

        if (projection) {
            if (layoutGroup?.group) layoutGroup.group.add(projection)

            if (switchLayoutGroup?.register && layoutId) {
                switchLayoutGroup.register(projection)
            }

            projection.root!.didUpdate()
            projection.addEventListener("animationComplete", () => {
                this.safeToRemove()
            })
            projection.setOptions({
                ...projection.options,
                onExitComplete: () => this.safeToRemove(),
            })
        }

        globalProjectionState.hasEverUpdated = true
    }

    getSnapshotBeforeUpdate(prevProps: FeatureProps & MeasureContextProps) {
        const { layoutDependency, visualElement, drag, isPresent } = this.props
        const projection = visualElement.projection

        if (!projection) return null

        /**
         * TODO: We use this data in relegate to determine whether to
         * promote a previous element. There's no guarantee its presence data
         * will have updated by this point - if a bug like this arises it will
         * have to be that we markForRelegation and then find a new lead some other way,
         * perhaps in didUpdate
         */
        projection.isPresent = isPresent

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
                projection.relegate()
            }
        }

        return null
    }

    componentDidUpdate() {
        const { projection } = this.props.visualElement
        if (projection) {
            projection.root!.didUpdate()
            if (!projection.currentAnimation && projection.isLead()) {
                this.safeToRemove()
            }
        }
    }

    componentWillUnmount() {
        const {
            visualElement,
            layoutGroup,
            switchLayoutGroup: promoteContext,
        } = this.props
        const { projection } = visualElement

        if (projection) {
            if (layoutGroup?.group) layoutGroup.group.remove(projection)
            if (promoteContext?.deregister)
                promoteContext.deregister(projection)
        }
    }

    safeToRemove() {
        this.props.safeToRemove?.()
    }

    render() {
        return null
    }
}

export function MeasureLayout(props: FeatureProps) {
    const [isPresent, safeToRemove] = usePresence()
    const layoutGroup = useContext(LayoutGroupContext)
    // Trigger a didUpdate onUnmount for siblings in the same layout group
    React.useEffect(() => {
        return () => {
            const { visualElement } = props
            const { projection } = visualElement
            if (layoutGroup.group && projection?.isLayoutDirty) {
                projection.root?.didUpdate()
            }
        }
    }, [])
    return (
        <MeasureLayoutWithContext
            {...props}
            layoutGroup={layoutGroup}
            switchLayoutGroup={useContext(SwitchLayoutGroupContext)}
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
