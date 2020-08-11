import { Presence } from "./types"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { ResolvedValues } from "../../render/types"
import { AxisBox2D, Point2D } from "../../types/geometry"
import { isTransformProp } from "../../render/dom/utils/transform"
import { elementDragControls } from "../../gestures/drag/VisualElementDragControls"
import { motionValue } from "../../value"
import { Transition } from "../../types"
import { LayoutTree } from "./SharedLayoutTree"

export function isSharedLayoutTree(
    child: HTMLVisualElement | LayoutTree
): child is LayoutTree {
    return child instanceof LayoutTree
}

export interface Snapshot {
    isDragging?: boolean
    cursorProgress?: Point2D
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
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
export function findLeadAndFollow<T extends LayoutTree | HTMLVisualElement>(
    stack: T[],
    [prevLead, prevFollow]: LeadAndFollow<T>
): LeadAndFollow<T> {
    let lead: T | undefined = undefined
    let leadIndex = 0
    let follow: T | undefined = undefined

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

    // Find the follow child.
    // For LayoutTrees, this may not be the preceding stack item.
    for (let i = leadIndex - 1; i >= 0; i--) {
        const child = stack[i]
        if (
            isSharedLayoutTree(child)
                ? child.props.isValidTree ||
                  child.props.isValidTree === undefined
                : true
        )
            follow = child
        break
    }

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

class Stack<T extends HTMLVisualElement | LayoutTree> {
    order: T[] = []

    lead?: T | undefined
    follow?: T | undefined

    prevLead?: T | undefined
    prevFollow?: T | undefined

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
}

export class LayoutStack extends Stack<HTMLVisualElement> {
    // Track whether we've ever had a child
    hasChildren: boolean = false

    snapshot?: Snapshot

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

    shouldStackAnimate(): boolean {
        if (this.lead && this.lead?.isPresent)
            return this.shouldPrimaryAnimate(this.lead, this.follow)

        if (this.follow)
            return this.shouldPrimaryAnimate(this.follow, this.lead)

        return true
    }

    shouldPrimaryAnimate(
        primary: HTMLVisualElement,
        secondary?: HTMLVisualElement
    ) {
        if (primary.config._shouldAnimateLayout === undefined) return true
        secondary && secondary.config._shouldAnimateLayout?.(false)
        return primary.config._shouldAnimateLayout(true) as boolean
    }

    getFollowOrigin(): AxisBox2D | undefined {
        // This shouldAnimate check is quite specifically a fix for the optimisation made in Framer
        // where components are kept in the tree ready to be re-used
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

export class TreeStack extends Stack<LayoutTree> {
    sortOrder() {
        this.order.sort((a, b) => a.props.layoutOrder - b.props.layoutOrder)
    }

    add(child: LayoutTree) {
        if (child.layoutOrder === undefined) return

        const { layoutOrder } = child.props
        let index = (this.order as LayoutTree[]).findIndex(
            stackChild => layoutOrder <= (stackChild.layoutOrder || 0)
        )

        if (index === -1) index = this.order.length

        this.order.splice(index, 0, child)
    }

    /**
     * Generate LayoutStacks from the children of the Lead and Follow trees.
     */
    createLayoutStacks(): Map<string, LayoutStack> {
        const stacks: Map<string, LayoutStack> = new Map()

        if (this.follow) {
            for (const child of this.follow.children) {
                if (!child.layoutId) continue

                const stack = new LayoutStack()

                child.isPresent = this.follow.isPresent
                stack.add(child)
                stacks.set(child.layoutId, stack)
                stack.updateLeadAndFollow()
            }
        }

        if (this.lead) {
            for (const child of this.lead.children) {
                if (!child.layoutId) continue

                let stack = stacks.get(child.layoutId)
                const existingStack = !!stack

                stack = stack || new LayoutStack()

                child.isPresent = this.lead.isPresent

                stack.add(child)
                stack.updateLeadAndFollow()

                if (!existingStack) stacks.set(child.layoutId, stack)
            }
        }

        return stacks
    }
}
