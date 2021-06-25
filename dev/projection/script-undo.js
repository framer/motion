Undo = {}

const { HTMLProjectionNode, sync, buildTransform } = Projection

Undo.createNode = (element, parent, options = {}) => {
    const latestTransform = {}

    function render() {
        Object.assign(
            element.style,
            {
                transform: buildTransform(
                    {
                        transform: latestTransform,
                        transformKeys: Object.keys(latestTransform),
                    },
                    {}
                ),
            },
            node.getProjectionStyles(latestTransform)
        )
    }

    function scheduleRender() {
        sync.render(render)
    }

    const node = new HTMLProjectionNode(parent)
    node.mount(element)
    node.setOptions({
        onProjectionUpdate: scheduleRender,
        ...options,
    })

    node.onLayoutDidUpdate(({ delta, hasLayoutChanged }) => {
        // console.log(hasLayoutChanged)
        // hasLayoutChanged && // or existing delta is not nothing - this needs to be reinstated to fix breaking tests
        node.setTargetDelta(delta)
    })

    node.setTransform = (key, value) => {
        latestTransform[key] = value
        scheduleRender()
    }

    return node
}

window.Undo = Undo
