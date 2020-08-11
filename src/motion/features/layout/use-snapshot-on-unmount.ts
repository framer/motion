import { VisualElement } from "../../../render/VisualElement"
import { useContext } from "react"
import {
    SharedLayoutContext,
    isSharedLayout,
} from "../../../components/AnimateSharedLayout/SharedLayoutContext"
import { useIsomorphicLayoutEffect } from "../../../utils/use-isomorphic-effect"

export function useSnapshotOnUnmount(visualElement: VisualElement) {
    const syncLayout = useContext(SharedLayoutContext)

    useIsomorphicLayoutEffect(
        () => () => {
            if (isSharedLayout(syncLayout)) {
                syncLayout.remove(visualElement as any)
            }
        },
        []
    )
}
