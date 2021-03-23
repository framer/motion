import { addUniqueItem, removeItem } from "../../utils/array"
import { VisualElement } from "../types"
import { sortByDepth } from "./sort-by-depth"

export class LayoutTree {
    children: VisualElement[] = []
    numChildren = 0

    private isDirty: boolean = false

    add(child: VisualElement) {
        addUniqueItem(this.children, child)
        this.isDirty = true
    }

    remove(child: VisualElement) {
        removeItem(this.children, child)
        this.isDirty = true
    }

    forEach(callback: (child: VisualElement) => void) {
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
