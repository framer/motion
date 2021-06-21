Undo = {}

const { HTMLProjectionNode, sync } = Projection

Undo.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode(parent)
    node.mount(element)
    node.setOptions({
        onLayoutUpdate: ({ delta }) => {
            node.setTargetDelta(delta)
        },
        onProjectionUpdate: () => {
            sync.render(() => {
                Object.assign(element.style, node.getProjectionStyles())
            })
        },
        ...options,
    })

    return node
}

window.Undo = Undo
