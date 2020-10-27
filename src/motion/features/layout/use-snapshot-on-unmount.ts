import { VisualElement } from "../../../render/VisualElement"
import { useContext } from "react"
import {
    SharedLayoutContext,
    FramerTreeContext,
    isSharedLayout,
} from "../../../components/AnimateSharedLayout/SharedLayoutContext"
import { useIsomorphicLayoutEffect } from "../../../utils/use-isomorphic-effect"

export function useSnapshotOnUnmount(visualElement: VisualElement) {
    const syncLayout = useContext(SharedLayoutContext)
    const framerTreeSync = useContext(FramerTreeContext)

    useIsomorphicLayoutEffect(
        () => () => {
            if (isSharedLayout(syncLayout)) {
                syncLayout.remove(visualElement as any)
            }

            if (isSharedLayout(framerTreeSync)) {
                framerTreeSync.remove(visualElement as any)
            }
        },
        []
    )
}
