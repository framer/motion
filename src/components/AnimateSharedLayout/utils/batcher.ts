import { flushSync } from "framesync"
import {
    collectProjectingAncestors,
    updateLayoutMeasurement,
} from "../../../render/dom/projection/utils"
import {
    batchLayout,
    flushLayout,
} from "../../../render/dom/utils/batch-layout"
import { VisualElement } from "../../../render/types"
import { compareByDepth } from "../../../render/utils/compare-by-depth"
import { Presence, SyncLayoutBatcher, SyncLayoutLifecycles } from "../types"

/**
 * Default handlers for batching VisualElements
 */
const defaultHandler: SyncLayoutLifecycles = {
    layoutReady: (child) => child.notifyLayoutReady(),
}

/**
 * Create a batcher to process VisualElements
 */
export function createBatcher(): SyncLayoutBatcher {
    const queue = new Set<VisualElement>()

    return {
        add: (child) => queue.add(child),
        flush: ({ layoutReady, parent } = defaultHandler) => {
            batchLayout((read, write) => {
                if (!queue.size) return
                const order = Array.from(queue).sort(compareByDepth)

                console.log("flush batch layout", order)
                const ancestors = parent
                    ? collectProjectingAncestors(parent)
                    : []

                write(() => {
                    const allElements = [...ancestors, ...order]
                    allElements.forEach((element) => element.resetTransform())
                })

                read(() => {
                    order.forEach((node) => updateLayoutMeasurement(node))
                })

                write(() => {
                    ancestors.forEach((element) => element.restoreTransform())
                    order.forEach(layoutReady)
                })

                read(() => {
                    /**
                     * After all children have started animating, ensure any Entering components are set to Present.
                     * If we add deferred animations (set up all animations and then start them in two loops) this
                     * could be moved to the start loop. But it needs to happen after all the animations configs
                     * are generated in AnimateSharedLayout as this relies on presence data
                     */
                    order.forEach((child) => {
                        if (child.isPresent) child.presence = Presence.Present
                    })
                })

                write(() => {
                    /**
                     * Starting these animations will have queued jobs on the frame loop. In some situations,
                     * like when removing an element, these will be processed too late after the DOM is manipulated,
                     * leaving a flash of incorrectly-projected content. By manually flushing these jobs
                     * we ensure there's no flash.
                     */
                    flushSync.preRender()
                    flushSync.render()

                    queue.clear()
                })
            })

            // TODO: Need to find a layout-synchronous way of flushing this
            flushLayout()
        },
    }
}
// function assignProjectionToSnapshot(child: VisualElement) {
//     child.snapshot = {
//         taken: 0,
//         viewportBox: child.projection.target,
//         transform: child.getLatestValues(),
//     }
// }
