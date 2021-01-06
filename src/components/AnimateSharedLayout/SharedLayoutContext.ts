import { createContext } from "react"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { Presence } from "./types"

/**
 * Handlers for batching sync layout lifecycles. We batches these processes to cut
 * down on layout thrashing
 */
export interface SyncLayoutLifecycles {
    measureLayout: (child: HTMLVisualElement) => void
    layoutReady: (child: HTMLVisualElement) => void
    parent?: HTMLVisualElement
}

/**
 * The exposed API for children to add themselves to the batcher and to flush it.
 */
export interface SyncLayoutBatcher {
    add: (child: HTMLVisualElement) => void
    flush: (handler?: SyncLayoutLifecycles) => void
}

/**
 * Extra API methods available to children if they're a descendant of AnimateSharedLayout
 */
export interface SharedLayoutSyncMethods extends SyncLayoutBatcher {
    syncUpdate: (force?: boolean) => void
    forceUpdate: () => void
    register: (child: HTMLVisualElement) => void
    remove: (child: HTMLVisualElement) => void
}

/**
 * Default handlers for batching VisualElements
 */
const defaultHandler: SyncLayoutLifecycles = {
    measureLayout: (child) => child.measureLayout(),
    layoutReady: (child) => child.layoutReady(),
}

/**
 * Sort VisualElements by tree depth, so we process the highest elements first.
 */
const sortByDepth = (a: HTMLVisualElement, b: HTMLVisualElement) =>
    a.depth - b.depth

/**
 * Create a batcher to process VisualElements
 */
export function createBatcher(): SyncLayoutBatcher {
    const queue = new Set<HTMLVisualElement>()

    const add = (child: HTMLVisualElement) => queue.add(child)

    const flush = ({
        measureLayout,
        layoutReady,
        parent,
    }: SyncLayoutLifecycles = defaultHandler) => {
        const order = Array.from(queue).sort(sortByDepth)

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

        parent ? parent.withoutTransform(resetAndMeasure) : resetAndMeasure()

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
    }

    return { add, flush }
}

export function isSharedLayout(
    context: SyncLayoutBatcher | SharedLayoutSyncMethods
): context is SharedLayoutSyncMethods {
    return !!(context as any).forceUpdate
}

export const SharedLayoutContext = createContext<
    SyncLayoutBatcher | SharedLayoutSyncMethods
>(createBatcher())

/**
 * @internal
 */
export const FramerTreeLayoutContext = createContext<
    SyncLayoutBatcher | SharedLayoutSyncMethods
>(createBatcher())
