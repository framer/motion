import { useConstant } from "../../utils/use-constant";
import { globalProjectionState } from "./create-projection-node";
var id = 1;
export function useProjectionId() {
    return useConstant(function () {
        if (globalProjectionState.hasEverUpdated) {
            return id++;
        }
    });
}
//# sourceMappingURL=id.js.map