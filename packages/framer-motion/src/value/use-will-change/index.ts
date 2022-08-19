import { isCSSVariable } from "../../render/dom/utils/is-css-variable"
import { transformProps } from "../../render/html/utils/transform"
import { addUniqueItem, removeItem } from "../../utils/array"
import { useConstant } from "../../utils/use-constant"
import { MotionValue } from ".."
import { WillChange } from "./types"
import { camelToDash } from "../../render/dom/utils/camel-to-dash"

export class WillChangeMotionValue extends MotionValue implements WillChange {
    private members: string[] = []
    private transforms = new Set<string>()

    add(name: string): void {
        let memberName: string | undefined

        if (transformProps.has(name)) {
            this.transforms.add(name)
            memberName = "transform"
        } else if (
            !name.startsWith("origin") &&
            !isCSSVariable(name) &&
            name !== "willChange"
        ) {
            memberName = camelToDash(name)
        }

        if (memberName) {
            addUniqueItem(this.members, memberName)
            this.update()
        }
    }

    remove(name: string): void {
        if (transformProps.has(name)) {
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
