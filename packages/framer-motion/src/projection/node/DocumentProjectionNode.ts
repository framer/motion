import { createProjectionNode } from "./create-projection-node"
import { addDomEvent } from "../../events/use-dom-event"

export const DocumentProjectionNode = createProjectionNode<Window>({
    attachResizeListener: (
        ref: Window | Element,
        notify: VoidFunction
    ): VoidFunction => addDomEvent(ref, "resize", notify),
    measureScroll: () => ({
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
    }),
    checkIsScrollRoot: () => true,
})
