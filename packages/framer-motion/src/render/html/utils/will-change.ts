import { addUniqueItem, removeItem } from "../../../utils/array"
import { isCSSVariable } from "../../dom/utils/is-css-variable"
import { isTransformOriginProp, isTransformProp } from "./transform"

export class WillChangeManager {
    private members: string[] = []
    private transforms = new Set<string>()
    private needsUpdate: boolean | undefined
    private current = "auto"

    add(name: string) {
        let memberName: string | undefined

        if (isTransformProp(name)) {
            this.transforms.add(name)
            memberName = "transform"
        } else if (!isTransformOriginProp(name) && !isCSSVariable(name)) {
            memberName = name
        }

        if (memberName) {
            this.needsUpdate = addUniqueItem(this.members, memberName)
        }
    }

    remove(name: string) {
        if (isTransformProp(name)) {
            this.transforms.delete(name)
            if (!this.transforms.size) {
                this.needsUpdate = removeItem(this.members, "transform")
            }
        } else if (!isTransformOriginProp(name) && !isCSSVariable(name)) {
            this.needsUpdate = removeItem(this.members, name)
        }
    }

    get() {
        if (this.needsUpdate) this.update()

        return this.current
    }

    private update() {
        this.current = this.members.length ? this.members.join(", ") : "auto"
        this.needsUpdate = false
    }
}
