import { IProjectionNode } from "../node/types"

export interface PromoteOptions {
    transfer?: "immediate" | "crossfade"
}

export class NodeStack {
    lead?: IProjectionNode
    members = new Set<IProjectionNode>()

    add(node: IProjectionNode) {
        !this.members.size && this.promote(node)

        this.members.add(node)
        node.scheduleRender()
    }

    promote(node: IProjectionNode) {
        const prevLead = this.lead
        this.lead = node

        node.show()

        if (prevLead) {
            prevLead.scheduleRender()
            node.snapshot = prevLead.snapshot
            node.snapshot.latestValues =
                prevLead.animationValues || prevLead.latestValues

            node.isLayoutDirty = true

            const { transfer } = node.options
            if (transfer === "immediate") {
                prevLead.hide()
            } else if (transfer === "crossfade") {
            }

            /**
             * TODO:
             *   - Test border radius when previous node was deleted
             *   - boxShadow mixing
             *   - Shared between element A in scrolled container and element B (scroll stays the same or changes)
             *   - Shared between element A in transformed container and element B (transform stays the same or changes)
             *   - Shared between element A in scrolled page and element B (scroll stays the same or changes)
             * ---
             *   - Crossfade opacity of root nodes
             *   - layoutId changes after animation
             *   - layoutId changes mid animation
             */
        }
    }
}
