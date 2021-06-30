Animate = {}

const { HTMLProjectionNode, sync, animateDelta } = Projection

let id = 1
Animate.createNode = (element, parent, options = {}) => {
    const node = new HTMLProjectionNode(id, {}, parent)
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
        hasLayoutChanged &&
            animateDelta(node, delta, { duration: 2, ease: () => 0.5 })
    })

    return node
}

window.Animate = Animate
