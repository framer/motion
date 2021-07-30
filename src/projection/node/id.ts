import { VisualElement } from "../../render/types"
import { useConstant } from "../../utils/use-constant"

let id = 1
export function useProjectionId(
    visualElement?: VisualElement
): number | undefined {
    return useConstant(() => {
        if (visualElement?.projection?.root?.hasEverUpdated) {
            return id++
        }
    })
}
