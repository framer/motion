import { createProjectionNode } from './create-projection-node.mjs';

var DocumentProjectionNode = createProjectionNode({
    attachResizeListener: function (ref, notify) {
        ref.addEventListener("resize", notify, { passive: true });
        return function () { return ref.removeEventListener("resize", notify); };
    },
    measureScroll: function () { return ({
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
    }); },
});

export { DocumentProjectionNode };
