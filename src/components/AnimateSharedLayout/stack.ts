import { Presence } from "./types"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { ResolvedValues } from "../../render/types"
import { AxisBox2D } from "../../types/geometry"
import { isTransformProp } from "../../render/dom/utils/transform"
import { motionValue } from "../.."

export interface Snapshot {
    isDragging: boolean
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
}

export interface StackChild {
    isPresent: () => boolean
    presence?: Presence
    prevViewportBox?: Snapshot
    layoutBox?: Snapshot
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
export function findLeadAndFollow<T extends HTMLVisualElement>(
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
            lastIsPresent = child.isPresent
        }

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
        stack.find(stackChild => stackChild === prevLead)
    ) {
        lead = prevLead
    }

    return [lead, follow]
}

export class LayoutStack<T extends HTMLVisualElement = HTMLVisualElement> {
    order: T[] = []

    lead?: T | undefined
    follow?: T | undefined

    prevLead?: T | undefined
    prevFollow?: T | undefined

    snapshot?: Snapshot

    // Track whether we've ever had a child
    hasChildren: boolean = false

    add(child: T) {
        const { layoutOrder } = child

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

        // Load previous values from snapshot into this child
        // TODO Neaten up
        // TODO Double check when reimplementing move
        // TODO Add isDragging status and
        if (this.snapshot) {
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
        if (this.lead) {
            const snapshot = {
                isDragging: false,
                boundingBox: this.lead.prevViewportBox,
                latestMotionValues: {},
            }

            this.lead.forEachValue((value, key) => {
                const latest = value.get()
                if (!isTransformProp(latest)) {
                    snapshot.latestMotionValues[key] = latest
                }
            })

            this.snapshot = snapshot
        }
    }

    isLeadPresent() {
        return this.lead && this.lead?.presence !== Presence.Exiting
    }

    shouldStackAnimate() {
        return this.lead && this.lead?.isPresent
            ? this.lead?.props?._shouldAnimate === true
            : this.follow && this.follow?.props._shouldAnimate === true
    }

    getFollowOrigin() {
        // This shouldAnimate check is quite specifically a fix for the optimisation made in Framer
        // where components are kept in the tree ready to be re-used
        return this.follow && this.follow.shouldAnimate
            ? this.follow.prevViewportBox
            : this.snapshot
    }

    getFollowTarget() {
        return this.follow?.layoutBox
    }

    getLeadOrigin() {
        return this.lead?.prevViewportBox
    }

    getLeadTarget() {
        return this.lead?.layoutBox
    }
}
