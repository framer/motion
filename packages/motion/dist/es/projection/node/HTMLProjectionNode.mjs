import { createProjectionNode } from './create-projection-node.mjs';
import { DocumentProjectionNode } from './DocumentProjectionNode.mjs';

var rootProjectionNode = {
    current: undefined,
};
var HTMLProjectionNode = createProjectionNode({
    measureScroll: function (instance) { return ({
        x: instance.scrollLeft,
        y: instance.scrollTop,
    }); },
    defaultParent: function () {
        if (!rootProjectionNode.current) {
            var documentNode = new DocumentProjectionNode(0, {});
            documentNode.mount(window);
            documentNode.setOptions({ layoutScroll: true });
            rootProjectionNode.current = documentNode;
        }
        return rootProjectionNode.current;
    },
    resetTransform: function (instance, value) {
        instance.style.transform = value !== null && value !== void 0 ? value : "none";
    },
});

export { HTMLProjectionNode, rootProjectionNode };
