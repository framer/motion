import { addUniqueItem, removeItem } from "../../utils/array"
import { sortByDepth } from "./sort-by-depth"

export interface DepthChild {
    depth: number
}

export class FlatTree {
    children: DepthChild[] = []
    numChildren = 0

    private isDirty: boolean = false

    add(child: DepthChild) {
        addUniqueItem(this.children, child)
        this.isDirty = true
    }

    remove(child: DepthChild) {
        removeItem(this.children, child)
        this.isDirty = true
    }

    forEach(callback: (child: DepthChild) => void) {
        this.isDirty && this.order()
        for (let i = 0; i < this.numChildren; i++) {
            callback(this.children[i])
        }
    }

    private order() {
        this.children.sort(sortByDepth)
        this.numChildren = this.children.length
    }
}
