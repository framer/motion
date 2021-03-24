import { addUniqueItem, removeItem } from "../../utils/array"
import { compareByDepth, WithDepth } from "./compare-by-depth"

export class FlatTree {
    private children: WithDepth[] = []

    private isDirty: boolean = false

    add(child: WithDepth) {
        addUniqueItem(this.children, child)
        this.isDirty = true
    }

    remove(child: WithDepth) {
        removeItem(this.children, child)
        this.isDirty = true
    }

    forEach(callback: (child: WithDepth) => void) {
        this.isDirty && this.children.sort(compareByDepth)

        const numChildren = this.children.length
        for (let i = 0; i < numChildren; i++) {
            callback(this.children[i])
        }
    }
}
