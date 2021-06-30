import {
    convertBoundingBoxToBox,
    transformBoxPoints,
} from "../geometry/conversion"
import { TransformPoint } from "../geometry/types"
import { createProjectionNode } from "./create-projection-node"
import { DocumentProjectionNode } from "./DocumentProjectionNode"
import { createProjectionId } from "./id"
import { IProjectionNode } from "./types"

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
            documentNode = new DocumentProjectionNode(createProjectionId(), {})
            documentNode.mount(window)
            documentNode.setOptions({
                shouldMeasureScroll: true,
            })
        }
        return documentNode
    },
    resetTransform: (instance) => (instance.style.transform = "none"),
})
