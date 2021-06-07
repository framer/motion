import { Presence, SharedLayoutAnimationConfig } from "../types"
import { Point2D } from "../../../types/geometry"
import { ResolvedValues, Snapshot, VisualElement } from "../../../render/types"
import { elementDragControls } from "../../../gestures/drag/VisualElementDragControls"
import { createCrossfader } from "./crossfader"

export type LeadAndFollow = [
    VisualElement | undefined,
    VisualElement | undefined
]

export interface LayoutStack {
    add(element: VisualElement): void
    remove(element: VisualElement): void
    getLead(): VisualElement | undefined
    updateSnapshot(): void
    clearSnapshot(): void
    animate(element: VisualElement, crossfade: boolean): void
    updateLeadAndFollow(): void
}

interface StackState {
    lead?: VisualElement
    follow?: VisualElement
    leadIsExiting: boolean
}

export function layoutStack(): LayoutStack {
    const stack = new Set<VisualElement>()
    const state: StackState = { leadIsExiting: false }
    let prevState: StackState = { ...state }

    let prevValues: ResolvedValues | undefined
    let snapshot: Snapshot | undefined
    let prevDragCursor: Point2D | undefined
    const crossfader = createCrossfader()
    let needsCrossfadeAnimation = false

    function getFollowViewportBox() {
        return state.follow
            ? state.follow.snapshot?.viewportBox
            : snapshot?.viewportBox
    }

    function getFollowLayout() {
        return state.follow?.getLayoutState().layout
    }

    return {
        add(element) {
            element.setCrossfader(crossfader)
            stack.add(element)

            /**
             * Hydrate new element with previous drag position if we have one
             */
            if (prevDragCursor) element.prevDragCursor = prevDragCursor

            if (!state.lead) state.lead = element
        },
        remove(element) {
            stack.delete(element)
        },
        getLead: () => state.lead,
        updateSnapshot() {
            if (!state.lead) return

            prevValues = crossfader.isActive()
                ? crossfader.getLatestValues()
                : state.lead.getLatestValues()
            snapshot = state.lead.snapshot

            const dragControls = elementDragControls.get(state.lead)
            if (dragControls && dragControls.isDragging) {
                prevDragCursor = dragControls.cursorProgress
            }
        },
        clearSnapshot() {
            prevDragCursor = snapshot = undefined
        },
        updateLeadAndFollow() {
            prevState = { ...state }

            let lead: VisualElement | undefined
            let follow: VisualElement | undefined
            const order = Array.from(stack)
            for (let i = order.length; i--; i >= 0) {
                const element = order[i]
                if (lead) follow ??= element
                lead ??= element
                if (lead && follow) break
            }
            state.lead = lead
            state.follow = follow
            state.leadIsExiting = state.lead?.presence === Presence.Exiting

            crossfader.setOptions({
                lead,
                follow,
                prevValues,
                crossfadeOpacity:
                    follow?.isPresenceRoot || lead?.isPresenceRoot,
            })

            if (
                // Don't crossfade if we've just animated back from lead and switched the
                // old follow to the new lead.
                state.lead !== prevState.follow &&
                (prevState.lead !== state.lead ||
                    prevState.leadIsExiting !== state.leadIsExiting)
            ) {
                needsCrossfadeAnimation = true
            }
        },
        animate(child, shouldCrossfade = false) {
            if (child === state.lead) {
                if (shouldCrossfade) {
                    /**
                     * Point a lead to itself in case it was previously pointing
                     * to a different visual element
                     */
                    child.pointTo(state.lead)
                } else {
                    child.setVisibility(true)
                }

                const config: SharedLayoutAnimationConfig = {}
                const prevParent = state.follow?.getProjectionParent()
                if (prevParent) {
                    /**
                     * We'll use this to determine if the element or its layoutId has been reparented.
                     */
                    config.prevParent = prevParent
                }

                if (child.presence === Presence.Entering) {
                    config.originBox = getFollowViewportBox()
                } else if (child.presence === Presence.Exiting) {
                    config.targetBox = getFollowLayout()
                }

                if (needsCrossfadeAnimation) {
                    needsCrossfadeAnimation = false
                    const transition = child.getDefaultTransition()

                    if (child.presence === Presence.Entering) {
                        crossfader.toLead(transition)
                    } else if (child.presence === Presence.Exiting) {
                        crossfader.fromLead(transition)
                    }
                }

                child.notifyLayoutReady(config)
            } else {
                if (shouldCrossfade) {
                    state.lead && child.pointTo(state.lead)
                } else {
                    child.setVisibility(false)
                }
            }
        },
    }
}
