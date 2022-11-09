import { Snapshot } from "../node/types"
import { calcBoxDelta } from "./delta-calc"
import { createDelta } from "./models"
import { Delta } from "./types"

export function calcSnapshotDelta(before: Snapshot, after: Snapshot): Delta {
    const visualDelta = createDelta()

    /**
     * If the previous snapshot was position: static we can use the flattened
     * layout box to compare snapshots.
     *
     * We never animate sticky transitions as the expectation here is if the
     * element becomes "stuck" that the sticking is instant. Without more
     * sophisticated detection of whether the element is stuck on an axis or
     * not animating these elements is easiest.
     */
    if (before.position !== "sticky" && after.position !== "sticky") {
        if (before.position === "static") {
            calcBoxDelta(visualDelta, after.layoutBox, before.layoutBox)
        } else if (before.position === "fixed") {
            calcBoxDelta(visualDelta, after.viewportBox, before.viewportBox)
        }
    }

    return visualDelta
}
