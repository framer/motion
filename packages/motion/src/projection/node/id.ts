import { useConstant } from "../../utils/use-constant"
import { globalProjectionState } from "./create-projection-node"

let id = 1
export function useProjectionId(): number | undefined {
    return useConstant(() => {
        if (globalProjectionState.hasEverUpdated) {
            return id++
        }
    })
}
