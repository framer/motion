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

    promote(
        node: IProjectionNode,
        { transfer = "immediate" }: PromoteOptions = {}
    ) {
        const prevLead = this.lead
        this.lead = node

        node.show()

        if (prevLead) {
            prevLead.scheduleRender()
            node.snapshot = prevLead.snapshot
            node.isLayoutDirty = true

            if (transfer === "immediate") {
                prevLead.hide()
            } else if (transfer === "crossfade") {
                // prevLead.followTargetBox(node)
            }
        }
    }
}
