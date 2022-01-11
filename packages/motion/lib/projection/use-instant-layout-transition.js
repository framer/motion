import { rootProjectionNode } from "./node/HTMLProjectionNode";
export function useInstantLayoutTransition() {
    return startTransition;
}
function startTransition(cb) {
    if (!rootProjectionNode.current)
        return;
    rootProjectionNode.current.isUpdating = false;
    rootProjectionNode.current.blockUpdate();
    cb === null || cb === void 0 ? void 0 : cb();
}
//# sourceMappingURL=use-instant-layout-transition.js.map