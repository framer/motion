import { createContext } from "react"
import {
    SharedLayoutSyncMethods,
    SyncLayoutBatcher,
} from "../components/AnimateSharedLayout/types"
import { createBatcher } from "../components/AnimateSharedLayout/utils/batcher"

export const SharedLayoutContext = createContext<
    SyncLayoutBatcher | SharedLayoutSyncMethods
>(createBatcher())

/**
 * @internal
 */
export const FramerTreeLayoutContext = createContext<
    SyncLayoutBatcher | SharedLayoutSyncMethods
>(createBatcher())

export function isSharedLayout(
    context: SyncLayoutBatcher | SharedLayoutSyncMethods
): context is SharedLayoutSyncMethods {
    return !!(context as any).forceUpdate
}
