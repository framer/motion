import { VisualElement } from "../../../render/types"
import { compareByDepth } from "../../../render/utils/compare-by-depth"
import { Presence, SyncLayoutBatcher, SyncLayoutLifecycles } from "../types"

/**
 * Default handlers for batching VisualElements
 */
const defaultHandler: SyncLayoutLifecycles = {
    measureLayout: (child) => child.updateLayoutMeasurement(),
    layoutReady: (child) => child.notifyLayoutReady(),
}

/**
 * Create a batcher to process VisualElements
 */
export function createBatcher(): SyncLayoutBatcher {
    const queue = new Set<VisualElement>()

    return {
        add: (child) => queue.add(child),
        flush: ({ measureLayout, layoutReady, parent } = defaultHandler) => {
            const order = Array.from(queue).sort(compareByDepth)

            const resetAndMeasure = () => {
                /**
                 * Write: Reset any transforms on children elements so we can read their actual layout
                 */
                order.forEach((child) => child.resetTransform())

                /**
                 * Read: Measure the actual layout
                 */
                order.forEach(measureLayout)
            }

            parent
                ? parent.withoutTransform(resetAndMeasure)
                : resetAndMeasure()

            /**
             * Write: Notify the VisualElements they're ready for further write operations.
             */
            order.forEach(layoutReady)

            /**
             * After all children have started animating, ensure any Entering components are set to Present.
             * If we add deferred animations (set up all animations and then start them in two loops) this
             * could be moved to the start loop. But it needs to happen after all the animations configs
             * are generated in AnimateSharedLayout as this relies on presence data
             */
            order.forEach((child) => {
                if (child.isPresent) child.presence = Presence.Present
            })

            queue.clear()
        },
    }
}
