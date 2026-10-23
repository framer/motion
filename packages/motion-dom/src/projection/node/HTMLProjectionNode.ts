import { measureSpace, neutraliseLayers } from "../quad/measure-space"
import { createProjectionNode } from "./create-projection-node"
import { DocumentProjectionNode } from "./DocumentProjectionNode"
import { rootProjectionNode } from "./root"
import { projectionInstances } from "./state"

const isTracked = (element: Element) => projectionInstances.has(element)

/**
 * The root every node in the document shares, so elements anywhere in it
 * (and nodes outside it, like planes in a canvas) share layoutIds.
 */
export const documentRoot = () => {
    if (!rootProjectionNode.current) {
        const documentNode = new DocumentProjectionNode({})
        documentNode.mount(window)
        documentNode.setOptions({ layoutScroll: true })
        rootProjectionNode.current = documentNode
    }
    return rootProjectionNode.current
}

export const HTMLProjectionNode =
    /* @__PURE__ */ createProjectionNode<HTMLElement>({
        measureScroll: (instance) => ({
            x: instance.scrollLeft,
            y: instance.scrollTop,
        }),
        defaultParent: documentRoot,
        resetTransform: (instance, value) => {
            instance.style.transform = value !== undefined ? value : "none"
        },
        checkIsScrollRoot: (instance) =>
            Boolean(window.getComputedStyle(instance).position === "fixed"),
        measureSpace: (instance, parent, pass, out) =>
            measureSpace(
                instance,
                parent?.instance instanceof Element ? parent.instance : null,
                isTracked,
                pass,
                out
            ),
        neutraliseLayers: (layers) => neutraliseLayers(layers as Element[]),
    })
