Undo = {}

const { HTMLProjectionNode, sync } = Projection

Undo.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode(parent)
    node.mount(element)
    node.setOptions({
        onProjectionUpdate: () => {
            sync.render(() => {
                Object.assign(element.style, node.getProjectionStyles())
            })
        },
        ...options,
    })

    node.onLayoutDidUpdate(({ delta, hasLayoutChanged }) => {
        // console.log(hasLayoutChanged)
        // hasLayoutChanged && // or existing delta is not nothing
        node.setTargetDelta(delta)
    })

    return node
}

window.Undo = Undo
