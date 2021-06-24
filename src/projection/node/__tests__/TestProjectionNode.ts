import { createBox } from "../../geometry/models"
import { Box } from "../../geometry/types"
import { createProjectionNode } from "../create-projection-node"
import { IProjectionNode } from "../types"

let rootNode: IProjectionNode

export const TestRootNode = createProjectionNode<{}>({
    measureScroll: (_instance) => ({ x: 0, y: 0 }),
})

interface TestInstance {
    resetTransform?: () => void
    box?: Box
}

export const TestProjectionNode = createProjectionNode<TestInstance>({
    measureScroll: (_instance) => ({ x: 0, y: 0 }),
    defaultParent: () => {
        if (!rootNode) {
            rootNode = new TestRootNode()
        }

        return rootNode
    },
    measureViewportBox: (instance) => instance.box || createBox(),
    resetTransform: (instance) => instance.resetTransform?.(),
})
