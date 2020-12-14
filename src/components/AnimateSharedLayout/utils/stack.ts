import { Presence } from "../types"
import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement"
import { ResolvedValues } from "../../../render/VisualElement/types"
import { AxisBox2D, Point2D } from "../../../types/geometry"
import { isTransformProp } from "../../../render/dom/utils/transform"
import { elementDragControls } from "../../../gestures/drag/VisualElementDragControls"
import { motionValue } from "../../../value"
import { Transition } from "../../../types"

export interface Snapshot {
    isDragging?: boolean
    cursorProgress?: Point2D
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
}

export type LeadAndFollow = [
    HTMLVisualElement | undefined,
    HTMLVisualElement | undefined
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
export function findLeadAndFollow(
    stack: HTMLVisualElement[],
    [prevLead, prevFollow]: LeadAndFollow
): LeadAndFollow {
    let lead: HTMLVisualElement | undefined = undefined
    let leadIndex = 0
    let follow: HTMLVisualElement | undefined = undefined

    // Find the lead child first
    const numInStack = stack.length
    let lastIsPresent: boolean | undefined = false

    for (let i = numInStack - 1; i >= 0; i--) {
        const child = stack[i]

        const isLastInStack = i === numInStack - 1
        if (isLastInStack) lastIsPresent = child.isPresent

        if (lastIsPresent) {
            lead = child
        } else {
            // If the child before this will be present, make this the
            // lead.
            const prev = stack[i - 1]
            if (prev && prev.isPresent) lead = child
        }

        if (lead) {
            leadIndex = i
            break
        }
    }

    if (!lead) lead = stack[0]

    // Find the follow child
    follow = stack[leadIndex - 1]

    // If the lead component is exiting, find the closest follow
    // present component
    if (lead) {
        for (let i = leadIndex - 1; i >= 0; i--) {
            const child = stack[i]
            if (child.isPresent) {
                follow = child
                break
            }
        }
    }

    // If the lead has changed and the previous lead still exists in the
    // stack, set it to the previous lead. This allows us to differentiate between
    // a, b, c(exit) -> a, b(exit), c(exit)
    // and
    // a, b(exit), c -> a, b(exit), c(exit)
    if (
        lead !== prevLead &&
        !lastIsPresent &&
        follow === prevFollow &&
        stack.find((stackChild) => stackChild === prevLead)
    ) {
        lead = prevLead
    }

    return [lead, follow]
}

export class LayoutStack {
    order: HTMLVisualElement[] = []

    lead?: HTMLVisualElement | undefined
    follow?: HTMLVisualElement | undefined

    prevLead?: HTMLVisualElement | undefined
    prevFollow?: HTMLVisualElement | undefined

    snapshot?: Snapshot

    // Track whether we've ever had a child
    hasChildren: boolean = false

    add(child: HTMLVisualElement) {
        this.order.push(child)

        // Load previous values from snapshot into this child
        // TODO Neaten up
        // TODO Double check when reimplementing move
        // TODO Add isDragging status and
        if (this.snapshot) {
            child.prevSnapshot = this.snapshot
            // TODO Remove in favour of above
            child.prevViewportBox = this.snapshot.boundingBox

            const latest = this.snapshot.latestMotionValues
            for (const key in latest) {
                if (!child.hasValue(key)) {
                    child.addValue(key, motionValue(latest[key]))
                } else {
                    child.getValue(key)?.set(latest[key])
                }
            }
        }

        this.hasChildren = true
    }

    remove(child: HTMLVisualElement) {
        const index = this.order.findIndex((stackChild) => child === stackChild)
        if (index !== -1) this.order.splice(index, 1)
    }

    updateLeadAndFollow() {
        this.prevLead = this.lead
        this.prevFollow = this.follow

        const [lead, follow] = findLeadAndFollow(this.order, [
            this.lead,
            this.follow,
        ])

        this.lead = lead
        this.follow = follow
    }

    updateSnapshot() {
        if (!this.lead) return

        const snapshot: Snapshot = {
            boundingBox: this.lead.prevViewportBox,
            latestMotionValues: {},
        }

        this.lead.forEachValue((value, key) => {
            const latest = value.get()
            if (!isTransformProp(latest)) {
                snapshot.latestMotionValues[key] = latest
            }
        })

        const dragControls = elementDragControls.get(this.lead)
        if (dragControls && dragControls.isDragging) {
            snapshot.isDragging = true
            snapshot.cursorProgress = dragControls.cursorProgress
        }

        this.snapshot = snapshot
    }

    isLeadPresent() {
        return this.lead && this.lead?.presence !== Presence.Exiting
    }

    getFollowOrigin(): AxisBox2D | undefined {
        return this.follow
            ? this.follow.prevViewportBox
            : this.snapshot?.boundingBox
    }

    getFollowTarget(): AxisBox2D | undefined {
        return this.follow?.box
    }

    getLeadOrigin(): AxisBox2D | undefined {
        return this.lead?.prevViewportBox
    }

    getLeadTarget(): AxisBox2D | undefined {
        return this.lead?.box
    }

    getLeadTransition(): Transition | undefined {
        return this.lead?.config.transition
    }
}
