import { Presence, SharedLayoutAnimationConfig } from "../types"
import { AxisBox2D, Point2D } from "../../../types/geometry"
import { isTransformProp } from "../../../render/dom/utils/transform"
import { elementDragControls } from "../../../gestures/drag/VisualElementDragControls"
import { Transition } from "../../../types"
import {
    ResolvedValues,
    VisualElement,
    VisualElementOptions,
} from "../../../render/types"

export interface Snapshot {
    isDragging?: boolean
    cursorProgress?: Point2D
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
}

export type LeadAndFollow = [
    VisualElement | undefined,
    VisualElement | undefined
]

/**
 * For each layout animation, we want to identify two components
 * within a stack that will serve as the "lead" and "follow" components.
 *
 * In the switch animation, the lead component performs the entire animation.
 * It uses the follow bounding box to animate out from and back to. The follow
 * component is hidden.
 *
 * In the crossfade animation, both the lead and follow components perform
 * the entire animation, animating from the follow origin bounding box to the lead
 * target bounding box.
 *
 * Generalising a stack as First In Last Out, *searching from the end* we can
 * generally consider the lead component to be:
 *  - If the last child is present, the last child
 *  - If the last child is exiting, the last *encountered* exiting component
 */
// export function findLeadAndFollow(
//     stack: VisualElement[],
//     [prevLead, prevFollow]: LeadAndFollow
// ): LeadAndFollow {
//     let lead: VisualElement | undefined = undefined
//     let leadIndex = 0
//     let follow: VisualElement | undefined = undefined

//     // Find the lead child first
//     const numInStack = stack.length
//     let lastIsPresent: boolean | undefined = false

//     for (let i = numInStack - 1; i >= 0; i--) {
//         const child = stack[i]

//         const isLastInStack = i === numInStack - 1
//         if (isLastInStack) lastIsPresent = child.isPresent

//         if (lastIsPresent) {
//             lead = child
//         } else {
//             // If the child before this will be present, make this the
//             // lead.
//             const prev = stack[i - 1]
//             if (prev && prev.isPresent) lead = child
//         }

//         if (lead) {
//             leadIndex = i
//             break
//         }
//     }

//     if (!lead) lead = stack[0]

//     // Find the follow child
//     follow = stack[leadIndex - 1]

//     // If the lead component is exiting, find the closest follow
//     // present component
//     if (lead) {
//         for (let i = leadIndex - 1; i >= 0; i--) {
//             const child = stack[i]
//             if (child.isPresent) {
//                 follow = child
//                 break
//             }
//         }
//     }

//     // If the lead has changed and the previous lead still exists in the
//     // stack, set it to the previous lead. This allows us to differentiate between
//     // a, b, c(exit) -> a, b(exit), c(exit)
//     // and
//     // a, b(exit), c -> a, b(exit), c(exit)
//     if (
//         lead !== prevLead &&
//         !lastIsPresent &&
//         follow === prevFollow &&
//         stack.find((stackChild) => stackChild === prevLead)
//     ) {
//         lead = prevLead
//     }

//     return [lead, follow]
// }

export interface LayoutStack {
    add(element: VisualElement): void
    remove(element: VisualElement): void
    getLead(): VisualElement | undefined
    updateSnapshot(): void
    animate(element: VisualElement, crossfade: boolean): void
}

export function layoutStack(): LayoutStack {
    const stack = new Set<VisualElement>()
    let lead: VisualElement
    let follow: VisualElement
    let prevViewportBox: AxisBox2D | undefined

    function setLead(newLead: VisualElement) {
        follow = lead
        lead = newLead
    }

    function getFollowViewportBox() {
        return follow ? follow.prevViewportBox : prevViewportBox
    }

    function getFollowLayout() {
        return follow?.getLayoutState().layout
    }

    return {
        add(element) {
            stack.add(element)
            setLead(element)
        },
        remove(element) {
            stack.delete(element)
        },
        getLead() {
            return lead
        },
        updateSnapshot() {
            prevViewportBox = lead.prevViewportBox
        },
        animate(child, crossfade = false) {
            if (child === lead) {
                if (crossfade) {
                    child.pointTo(lead)
                } else {
                    child.setVisibility(true)
                }

                const config: SharedLayoutAnimationConfig = {}

                if (child.presence === Presence.Entering) {
                    config.originBox = getFollowViewportBox()
                } else if (child.presence === Presence.Exiting) {
                    config.targetBox = getFollowLayout()
                }

                child.notifyLayoutReady(config)
            } else {
                if (crossfade) {
                    child.pointTo(lead)
                } else {
                    child.setVisibility(false)
                }
            }
        },
    }
}

// export class LayoutStack {
//     order: VisualElement[] = []

//     lead?: VisualElement | undefined
//     follow?: VisualElement | undefined

//     prevLead?: VisualElement | undefined
//     prevFollow?: VisualElement | undefined

//     snapshot?: Snapshot

//     getLead() {
//         return this.lead
//     }

//     updateLeadAndFollow() {
//         this.prevLead = this.lead
//         this.prevFollow = this.follow

//         const [lead, follow] = findLeadAndFollow(this.order, [
//             this.lead,
//             this.follow,
//         ])

//         this.lead = lead
//         this.follow = follow
//     }

//     // updateSnapshot() {
//     //     if (!this.lead) return

//     //     const snapshot: Snapshot = {
//     //         boundingBox: this.lead.getProjection().target,
//     //         latestMotionValues: {},
//     //     }

//     //     this.lead.forEachValue((value, key) => {
//     //         const latest = value.get()
//     //         if (!isTransformProp(latest)) {
//     //             snapshot.latestMotionValues[key] = latest
//     //         }
//     //     })

//     //     const dragControls = elementDragControls.get(this.lead)
//     //     if (dragControls && dragControls.isDragging) {
//     //         snapshot.isDragging = true
//     //         snapshot.cursorProgress = dragControls.cursorProgress
//     //     }

//     //     this.snapshot = snapshot
//     // }

//     isLeadPresent() {
//         return this.lead && this.lead?.presence !== Presence.Exiting
//     }
// }
