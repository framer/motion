import { addUniqueItem, removeItem } from "../../utils/array"
import { useConstant } from "../../utils/use-constant"
import { MotionValue } from ".."
import { WillChange } from "./types"
import { camelToDash } from "../../render/dom/utils/camel-to-dash"
import { getWillChangeName } from "./get-will-change-name"

export class WillChangeMotionValue extends MotionValue implements WillChange {
    private members: string[] = []
    private transforms = new Set<string>()

    add(name: string): void {
        const memberName = getWillChangeName(name)

        if (memberName) {
            if (memberName === "transform") {
                this.transforms.add(name)
            }

            addUniqueItem(this.members, memberName)
            this.update()
        }
    }

    remove(name: string): void {
        const memberName = getWillChangeName(name)

        if (memberName === "transform") {
            this.transforms.delete(name)
            if (!this.transforms.size) {
                removeItem(this.members, "transform")
            }
        } else {
            removeItem(this.members, camelToDash(name))
        }

        this.update()
    }

    private update() {
        this.set(this.members.length ? this.members.join(", ") : "auto")
    }
}

export function useWillChange(): WillChange {
    return useConstant(() => new WillChangeMotionValue("auto"))
}
