import { VisualElement } from "../../../render/types"
import { useContext } from "react"
import {
    SharedLayoutContext,
    FramerTreeLayoutContext,
    isSharedLayout,
} from "../../../context/SharedLayoutContext"
import { useIsomorphicLayoutEffect } from "../../../utils/use-isomorphic-effect"

export function useSnapshotOnUnmount(visualElement: VisualElement) {
    const syncLayout = useContext(SharedLayoutContext)
    const framerSyncLayout = useContext(FramerTreeLayoutContext)

    useIsomorphicLayoutEffect(
        () => () => {
            if (isSharedLayout(syncLayout)) {
                syncLayout.remove(visualElement as any)
            }

            if (isSharedLayout(framerSyncLayout)) {
                framerSyncLayout.remove(visualElement as any)
            }
        },
        []
    )
}
