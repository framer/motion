Animate = {}

const { HTMLProjectionNode, sync, animateDelta } = Projection

Animate.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode({}, parent)
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
        hasLayoutChanged && animateDelta(node, delta, { duration: 2 })
    })

    return node
}

window.Animate = Animate
