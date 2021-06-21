import {
    convertBoundingBoxToBox,
    transformBoxPoints,
} from "../geometry/conversion"
import { TransformPoint } from "../geometry/types"
import { createProjectionNode, IProjectionNode } from "./create-projection-node"
import { DocumentProjectionNode } from "./DocumentProjectionNode"

let documentNode: IProjectionNode

export function measureViewportBox(
    instance: HTMLElement,
    transformPoint?: TransformPoint
) {
    return convertBoundingBoxToBox(
        transformBoxPoints(instance.getBoundingClientRect(), transformPoint)
    )
}

export const HTMLProjectionNode = createProjectionNode<HTMLElement>({
    measureScroll: (instance) => ({
        x: instance.scrollLeft,
        y: instance.scrollTop,
    }),
    measureViewportBox,
    defaultParent: () => {
        if (!documentNode) {
            documentNode = new DocumentProjectionNode()
            documentNode.mount(window)
            documentNode.setOptions({
                shouldMeasureScroll: true,
            })
        }
        return documentNode
    },
})
