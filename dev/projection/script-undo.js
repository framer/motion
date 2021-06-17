Undo = {}

const { HTMLProjectionNode, sync } = Projection

Undo.createNode = (element, parent) => {
    const node = new HTMLProjectionNode(
        element,
        {
            onLayoutUpdate: ({ delta }) => {
                node.setTargetDelta(delta)
            },
            onProjectionUpdate: () => {
                sync.render(() => {
                    Object.assign(
                        element.style,
                        boxProjection.getProjectionStyles()
                    )
                })
            },
        },
        parent
    )

    return node
}

window.Undo = Undo
