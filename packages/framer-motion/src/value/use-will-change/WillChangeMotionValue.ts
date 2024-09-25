import { MotionValue } from ".."
import { WillChange } from "./types"
import { getWillChangeName } from "./get-will-change-name"
import { addUniqueItem } from "../../utils/array"

export class WillChangeMotionValue extends MotionValue implements WillChange {
    private values: string[] = []

    add(name: string) {
        const styleName = getWillChangeName(name)

        if (styleName) {
            addUniqueItem(this.values, styleName)
            this.update()
        }
    }

    private update() {
        this.set(this.values.length ? this.values.join(", ") : "auto")
    }
}
