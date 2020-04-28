//import { Snapshot } from "../../motion/features/auto/types"

export interface Child {
    isPresent: () => boolean
    measuredOrigin?: any
}

export type LeadAndFollow = [Child | undefined, Child | undefined]

export function findLeadAndFollow(
    stack: Child[],
    [prevLead, prevFollow]: LeadAndFollow
): LeadAndFollow {
    let lead: Child | undefined = undefined
    let leadIndex = 0
    let follow: Child | undefined = undefined

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

    if (
        !lastIsPresent &&
        lead !== prevLead &&
        follow === prevFollow &&
        stack.find(stackChild => stackChild === prevLead)
    ) {
        lead = prevLead
    }

    return [lead, follow]
}

// export class Stack {
//     private order: Child[] = []

//     previous?: Child | undefined
//     lead?: Child | undefined

//     snapshot?: Snapshot

//     add(child: Child) {
//         this.order.push(child)
//         this.lead =
//     }

//     remove(child: Child) {
//         const index = this.order.findIndex(stackChild => child === stackChild)
//         if (index === -1) return

//         this.order.splice(index, 1)
//     }

//     updateLead() {
//         const numChildren = this.order.length
//         this.order.forEach((child, i) => {})

//         /**
//          * The lead component is
//          * - The last present child OR
//          * - The first exiting child UNLESS
//          *    - The current
//          *
//          * The previous component is
//          * - The immediate previous present component
//          *    -
//          */
//     }

//     updateSnapshot() {
//         this.lead && this.lead.measuredOrigin
//     }
// }
