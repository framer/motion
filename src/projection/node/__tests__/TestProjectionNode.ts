import {
    createProjectionNode,
    IProjectionNode,
} from "../create-projection-node"

let rootNode: IProjectionNode

export const TestRootNode = createProjectionNode<{}>({
    measureScroll: (_instance) => ({ x: 0, y: 0 }),
})

export const TestProjectionNode = createProjectionNode<{}>({
    measureScroll: (_instance) => ({ x: 0, y: 0 }),
    defaultParent: () => {
        if (!rootNode) {
            rootNode = new TestRootNode()
        }

        return rootNode
    },
})
