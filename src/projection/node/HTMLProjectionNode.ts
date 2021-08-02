import {
    convertBoundingBoxToBox,
    transformBoxPoints,
} from "../geometry/conversion"
import { TransformPoint } from "../geometry/types"
import { createProjectionNode } from "./create-projection-node"
import { DocumentProjectionNode } from "./DocumentProjectionNode"
import { IProjectionNode } from "./types"

export const rootProjectionNode: { current: IProjectionNode | undefined } = {
    current: undefined,
}

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
    defaultParent: () => {
        if (!rootProjectionNode.current) {
            const documentNode = new DocumentProjectionNode(0, {})
            documentNode.mount(window)
            documentNode.setOptions({
                shouldMeasureScroll: true,
            })
            rootProjectionNode.current = documentNode
        }
        return rootProjectionNode.current
    },
    resetTransform: (instance) => (instance.style.transform = "none"),
})
