import { addUniqueItem, removeItem } from "../../utils/array"
import { IProjectionNode } from "../node/types"

export class NodeStack {
    lead?: IProjectionNode
    prevLead?: IProjectionNode
    members: IProjectionNode[] = []

    add(node: IProjectionNode) {
        addUniqueItem(this.members, node)
        this.promote(node)
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

    relegate(node: IProjectionNode): boolean {
        const indexOfNode = this.members.findIndex((member) => node === member)
        if (indexOfNode === 0) return false

        const prevLead = this.members[indexOfNode - 1]
        if (!prevLead) return false
        this.promote(prevLead)
        return true
    }

    promote(node: IProjectionNode) {
        const prevLead = this.lead

        if (node === prevLead) return
        this.prevLead = prevLead
        this.lead = node

        node.show()

        if (prevLead) {
            prevLead.scheduleRender()
            node.scheduleRender()
            node.root?.startUpdate()
            node.resumeFrom = prevLead

            if (prevLead.snapshot) {
                node.snapshot = prevLead.snapshot
                node.snapshot.latestValues =
                    prevLead.animationValues || prevLead.latestValues
                node.snapshot.isShared = true
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

    exitAnimationComplete() {
        this.members.forEach((node) => node.options.onExitComplete?.())
    }
}
