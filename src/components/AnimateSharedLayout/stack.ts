import { Snapshot } from "../../motion/features/auto/types"
import { Presence } from "./types"

export interface StackChild {
    isPresent: () => boolean
    presence?: Presence
    measuredOrigin?: Snapshot
    measuredTarget?: Snapshot
    shouldAnimate?: boolean
    props: {
        layoutOrder?: number
        _shouldAnimate?: boolean
    }
}

export type LeadAndFollow<T> = [T | undefined, T | undefined]

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
export function findLeadAndFollow<T extends StackChild>(
    stack: T[],
    [prevLead, prevFollow]: LeadAndFollow<T>
): LeadAndFollow<T> {
    let lead: T | undefined = undefined
    let leadIndex = 0
    let follow: T | undefined = undefined

    // Find the lead child first
    const numInStack = stack.length
    let lastIsPresent = false

    for (let i = numInStack - 1; i >= 0; i--) {
        const child = stack[i]

        const isLastInStack = i === numInStack - 1
        if (isLastInStack) {
            lastIsPresent = child.isPresent()
        }

        if (lastIsPresent) {
            lead = child
        } else {
            // If the child before this will be present, make this the
            // lead.
            const prev = stack[i - 1]
            if (prev && prev.isPresent()) lead = child
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
            if (child.isPresent()) {
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
        stack.find(stackChild => stackChild === prevLead)
    ) {
        lead = prevLead
    }

    return [lead, follow]
}

export class LayoutStack<T extends StackChild = StackChild> {
    order: T[] = []

    lead?: T | undefined
    follow?: T | undefined

    prevLead?: T | undefined
    prevFollow?: T | undefined

    snapshot?: Snapshot

    // Track whether we've ever had a child
    hasChildren: boolean = false

    add(child: T) {
        const { layoutOrder } = child.props

        if (layoutOrder === undefined) {
            this.order.push(child)
        } else {
            let index = this.order.findIndex(
                stackChild => layoutOrder <= (stackChild.props.layoutOrder || 0)
            )

            if (index === -1) {
                child.presence = this.hasChildren
                    ? Presence.Entering
                    : Presence.Present
                index = this.order.length
            }

            this.order.splice(index, 0, child)
        }

        this.hasChildren = true
    }

    remove(child: T) {
        const index = this.order.findIndex(stackChild => child === stackChild)
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
        if (this.lead) this.snapshot = this.lead.measuredOrigin
    }

    isLeadPresent() {
        return this.lead && this.lead?.presence !== Presence.Exiting
    }

    shouldStackAnimate() {
        return this.lead && this.lead?.isPresent()
            ? this.lead?.props?._shouldAnimate === true
            : this.follow && this.follow?.props._shouldAnimate === true
    }

    getFollowOrigin() {
        return this.follow ? this.follow.measuredOrigin : this.snapshot
    }

    getFollowTarget() {
        return this.follow?.measuredTarget
    }

    getLeadOrigin() {
        return this.lead?.measuredOrigin
    }

    getLeadTarget() {
        return this.lead?.measuredTarget
    }
}
