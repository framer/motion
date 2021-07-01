import { IProjectionNode } from "../node/types"

export class NodeStack {
    lead?: IProjectionNode
    members = new Set<IProjectionNode>()

    add(node: IProjectionNode) {
        !this.members.size && this.promote(node)

        this.members.add(node)
        node.options.onProjectionUpdate?.()
    }

    promote(node: IProjectionNode) {
        const prevLead = this.lead
        this.lead = node

        node.options.onProjectionUpdate?.()

        if (prevLead) {
            prevLead.options.onProjectionUpdate?.()
            node.snapshot = prevLead.snapshot
            node.isLayoutDirty = true
        }
    }
}
