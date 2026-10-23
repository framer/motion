"use client"

import { frame, microtask, globalProjectionState, type VisualElement } from "motion-dom"
import { Component, useContext } from "react"
import { usePresence } from "../../../components/AnimatePresence/use-presence"
import {
    LayoutGroupContext,
    LayoutGroupContextProps,
} from "../../../context/LayoutGroupContext"
import { SwitchLayoutGroupContext } from "../../../context/SwitchLayoutGroupContext"
import { MotionProps } from "../../types"

interface MeasureContextProps {
    layoutGroup: LayoutGroupContextProps
    switchLayoutGroup?: SwitchLayoutGroupContext
    isPresent: boolean
    safeToRemove?: VoidFunction | null
}

type MeasureProps = MotionProps &
    MeasureContextProps & { visualElement: VisualElement }

/**
 * Track whether we've taken any snapshots yet. If not,
 * we can safely skip notification of didUpdate.
 *
 * Difficult to capture in a test but to prevent flickering
 * we must set this to true either on update or unmount.
 * Running `next-env/layout-id` in Safari will show this behaviour if broken.
 */
let hasTakenAnySnapshot = false

/**
 * The projection node is created with the props from the component's first
 * render, so keep these in sync as they can change (or be enabled) later.
 */
const layoutOptions = ({
    layout,
    layoutDependency,
    layoutAnchor,
}: MeasureProps) => ({
    layout,
    layoutDependency,
    layoutAnchor,
    animationType: typeof layout === "string" ? layout : "both",
})

class MeasureLayoutWithContext extends Component<MeasureProps> {
    /**
     * This only mounts projection nodes for components that
     * need measuring, we might want to do it for all components
     * in order to incorporate transforms
     */
    componentDidMount() {
        const { visualElement, layoutGroup, switchLayoutGroup, layoutId } =
            this.props
        const { projection } = visualElement

        if (projection) {
            layoutGroup.group?.add(projection)
            layoutId && switchLayoutGroup?.register?.(projection)

            if (hasTakenAnySnapshot) {
                projection.root!.didUpdate()
            }

            projection.addEventListener("animationComplete", () =>
                this.safeToRemove()
            )
            projection.setOptions({
                ...projection.options,
                ...layoutOptions(this.props),
                onExitComplete: () => this.safeToRemove(),
            })
        }

        globalProjectionState.hasEverUpdated = true
    }

    getSnapshotBeforeUpdate(prevProps: MeasureProps) {
        const { layoutDependency, layoutId, visualElement, drag, isPresent } =
            this.props
        const { projection } = visualElement

        if (!projection) return null

        /**
         * TODO: We use this data in relegate to determine whether to
         * promote a previous element. There's no guarantee its presence data
         * will have updated by this point - if a bug like this arises it will
         * have to be that we markForRelegation and then find a new lead some other way,
         * perhaps in didUpdate
         */
        projection.isPresent = isPresent

        /**
         * If layoutId changes, move this node to the new layoutId's stack.
         * It's already on screen, so it takes over the new stack instantly:
         * it keeps its own snapshot rather than resuming from the lead, and
         * the lead is hidden, as it would be at the end of a crossfade.
         */
        if (prevProps.layoutId !== layoutId) {
            projection.willUpdate()
            const { snapshot } = projection
            const stack = projection.getStack()
            stack?.remove(projection)
            /**
             * The old stack's new lead animates from this node's snapshot,
             * which it now holds. Unlike a node that unmounts, this one stays
             * mounted, so unlink them: the new lead mustn't read this node's
             * snapshot after it changes, or stop or share its animation.
             */
            const lead = stack?.lead
            if (lead?.resumeFrom === projection)
                lead.resumeFrom =
                    lead.currentAnimation =
                    projection.resumingFrom =
                        undefined
            projection.options.layoutId = layoutId
            if (layoutId) {
                projection.getStack()?.lead?.hide()
                projection.root!.registerSharedNode(layoutId, projection)
                projection.resumeFrom = undefined
                projection.snapshot = snapshot
            }
        }

        projection.setOptions({
            ...projection.options,
            ...layoutOptions(this.props),
        })

        hasTakenAnySnapshot = true

        if (
            drag ||
            prevProps.layoutDependency !== layoutDependency ||
            layoutDependency === undefined ||
            prevProps.isPresent !== isPresent
        ) {
            projection.willUpdate()
        } else {
            this.safeToRemove()
        }

        if (prevProps.isPresent !== isPresent) {
            if (isPresent) {
                projection.promote()
            } else if (!projection.relegate()) {
                /**
                 * If there's another stack member taking over from this one,
                 * it's in charge of the exit animation and therefore should
                 * be in charge of the safe to remove. Otherwise we call it here.
                 */
                frame.postRender(() => {
                    projection.getStack()?.members.length || this.safeToRemove()
                })
            }
        }

        return null
    }

    componentDidUpdate() {
        const { projection } = this.props.visualElement
        if (projection) {
            projection.root!.didUpdate()

            microtask.postRender(() => {
                if (!projection.currentAnimation && projection.isLead()) {
                    this.safeToRemove()
                }
            })
        }
    }

    componentWillUnmount() {
        const {
            visualElement,
            layoutGroup,
            switchLayoutGroup: promoteContext,
        } = this.props
        const { projection } = visualElement

        hasTakenAnySnapshot = true

        if (projection) {
            projection.scheduleCheckAfterUnmount()
            layoutGroup.group?.remove(projection)
            promoteContext?.deregister?.(projection)
        }
    }

    safeToRemove() {
        this.props.safeToRemove?.()
    }

    render() {
        return null
    }
}

export function MeasureLayout(
    props: MotionProps & { visualElement: VisualElement }
) {
    const [isPresent, safeToRemove] = usePresence()
    const layoutGroup = useContext(LayoutGroupContext)

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
