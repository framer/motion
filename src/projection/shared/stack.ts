import { IProjectionNode } from "../node/types"

export class NodeStack {
    lead?: IProjectionNode
    members = new Set<IProjectionNode>()

    add(node: IProjectionNode) {
        if (!this.members.size) {
            this.lead = node
        }

        this.members.add(node)
        node.options.onProjectionUpdate?.()
    }
}
