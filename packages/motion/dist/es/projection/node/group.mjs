var notify = function (node) {
    return !node.isLayoutDirty && node.willUpdate(false);
};
function nodeGroup() {
    var nodes = new Set();
    var subscriptions = new WeakMap();
    var dirtyAll = function () { return nodes.forEach(notify); };
    return {
        add: function (node) {
            nodes.add(node);
            subscriptions.set(node, node.addEventListener("willUpdate", dirtyAll));
        },
        remove: function (node) {
            var _a;
            nodes.delete(node);
            (_a = subscriptions.get(node)) === null || _a === void 0 ? void 0 : _a();
            subscriptions.delete(node);
            dirtyAll();
        },
        dirty: dirtyAll,
    };
}

export { nodeGroup };
