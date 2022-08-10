import { isCSSVariable } from "../../render/dom/utils/is-css-variable"
import {
    isTransformOriginProp,
    isTransformProp,
} from "../../render/html/utils/transform"
import { addUniqueItem, removeItem } from "../../utils/array"
import { useConstant } from "../../utils/use-constant"
import { MotionValue } from ".."
import { WillChange } from "./types"

export class WillChangeMotionValue extends MotionValue implements WillChange {
    private members: string[] = []
    private transforms = new Set<string>()
    private needsUpdate: boolean | undefined

    add(name: string): void {
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

    remove(name: string): void {
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
        return super.get()
    }

    private update() {
        this.set(this.members.length ? this.members.join(", ") : "auto")
        this.needsUpdate = false
    }
}

export function useWillChange(): WillChange {
    return useConstant(() => new WillChangeMotionValue("auto"))
}
