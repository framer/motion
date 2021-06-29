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
                        transform: defaultValueType(latestTransform),
                        transformKeys: Object.keys(latestTransform),
                    },
                    {}
                ),
            },
            node.getProjectionStyles()
        )
    }

    function scheduleRender() {
        sync.render(render)
    }

    const node = new HTMLProjectionNode(latestTransform, parent)
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

function defaultValueType(transform) {
    const withValueType = {}

    for (const key in transform) {
        if (key === "x" || key === "y") {
            withValueType[key] = transform[key] + "px"
        } else {
            withValueType[key] = transform[key]
        }
    }

    return withValueType
}

window.Undo = Undo
