import { compareByDepth } from "../../../render/utils/compare-by-depth"
import { addUniqueItem, removeItem } from "../../../utils/array"
import type { AnimationState } from "./AnimationState"

let scheduled: AnimationState[] | undefined = undefined

function process() {
    if (!scheduled) return
    console.log("process")
    scheduled.sort(compareByDepth).map((state) => state.animateChanges())

    scheduled = undefined
}

export function scheduleAnimation(state: AnimationState) {
    if (!scheduled) {
        scheduled = [state]
        requestAnimationFrame(process)
    } else {
        addUniqueItem(scheduled, state)
    }
}

export function unscheduleAnimation(state: AnimationState) {
    scheduled && removeItem(scheduled, state)
}
