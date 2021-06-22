Animate = {}

const { HTMLProjectionNode, sync, animateDelta } = Projection

Animate.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode(parent)
    node.mount(element)
    node.setOptions({
        onLayoutUpdate: ({ delta, hasLayoutChanged }) => {
            hasLayoutChanged &&
                animateDelta(node, delta, { duration: 2 }, "size")
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

window.Animate = Animate
