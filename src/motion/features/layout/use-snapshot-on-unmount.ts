import { VisualElement } from "../../../render/VisualElement"
import { useContext } from "react"
import {
    SharedLayoutContext,
    isSharedLayout,
} from "../../../components/AnimateSharedLayout/SharedLayoutContext"
import { useUnmountEffect } from "../../../utils/use-unmount-effect"

export function useSnapshotOnUnmount(visualElement: VisualElement) {
    const syncLayout = useContext(SharedLayoutContext)
    useUnmountEffect(() => {
        if (isSharedLayout(syncLayout)) syncLayout.remove(visualElement as any)
    })
}
