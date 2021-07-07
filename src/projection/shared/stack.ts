import { addUniqueItem, removeItem } from "../../utils/array"
import { IProjectionNode } from "../node/types"

export class NodeStack {
    lead?: IProjectionNode
    members: IProjectionNode[] = []

    add(node: IProjectionNode) {
        // !this.members.size &&
        this.promote(node)

        addUniqueItem(this.members, node)
        node.scheduleRender()
    }

    remove(node: IProjectionNode) {
        removeItem(this.members, node)
        if (node === this.lead) {
            const prevLead = this.members[this.members.length - 1]
            if (prevLead) {
                this.promote(prevLead)
            }
        }
    }

    promote(node: IProjectionNode) {
        const prevLead = this.lead
        this.lead = node

        node.show()

        if (prevLead) {
            prevLead.scheduleRender()
            node.snapshot = prevLead.snapshot

            if (node.snapshot) {
                node.snapshot.latestValues =
                    prevLead.animationValues || prevLead.latestValues
            }

            node.isLayoutDirty = true

            const { crossfade } = node.options
            if (crossfade === false) {
                prevLead.hide()
            } else {
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
