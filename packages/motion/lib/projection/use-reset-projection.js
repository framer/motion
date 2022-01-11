import * as React from "react";
import { rootProjectionNode } from "./node/HTMLProjectionNode";
export function useResetProjection() {
    var reset = React.useCallback(function () {
        var root = rootProjectionNode.current;
        if (!root)
            return;
        root.resetTree();
    }, []);
    return reset;
}
//# sourceMappingURL=use-reset-projection.js.map