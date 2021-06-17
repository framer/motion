import { convertBoundingBoxToBox } from "../geometry/conversion"
import { createProjectionNode, IProjectionNode } from "./create-projection-node"
import { DocumentProjectionNode } from "./DocumentProjectionNode"

let documentNode: IProjectionNode

export const HTMLProjectionNode = createProjectionNode<HTMLElement>({
    measureScroll: (instance) => ({
        x: instance.scrollLeft,
        y: instance.scrollTop,
    }),
    measureViewportBox: (instance) =>
        convertBoundingBoxToBox(instance.getBoundingClientRect()),
    defaultParent: () => {
        if (!documentNode) {
            documentNode = new DocumentProjectionNode(window, {
                applyScroll: true,
            })
        }
        return documentNode
    },
})
