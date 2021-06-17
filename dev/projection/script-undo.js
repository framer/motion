Undo = {}

const { HTMLProjectionNode, sync } = Projection

Undo.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode(
        element,
        {
            onLayoutUpdate: ({ delta }) => {
                node.setTargetDelta(delta)
            },
            onProjectionUpdate: () => {
                sync.render(() => {
                    Object.assign(element.style, node.getProjectionStyles())
                })
            },
            ...options,
        },
        parent
    )

    return node
}

window.Undo = Undo
