Undo = {}

const {
    HTMLProjectionNode,
    sync,
    buildTransform,
    animateDelta,
    addScaleCorrector,
    correctBoxShadow,
    correctBorderRadius,
} = Projection

addScaleCorrector({
    borderRadius: {
        ...correctBorderRadius,
        applyTo: [
            "borderTopLeftRadius",
            "borderTopRightRadius",
            "borderBottomLeftRadius",
            "borderBottomRightRadius",
        ],
    },
    borderTopLeftRadius: correctBorderRadius,
    borderTopRightRadius: correctBorderRadius,
    borderBottomLeftRadius: correctBorderRadius,
    borderBottomRightRadius: correctBorderRadius,
    boxShadow: correctBoxShadow,
})

let id = 1
Undo.createNode = (element, parent, options = {}, overrideId) => {
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

    id++
    const node = new HTMLProjectionNode(
        overrideId || id,
        latestTransform,
        parent
    )

    node.setOptions({
        onProjectionUpdate: scheduleRender,
        ...options,
    })

    if (!overrideId) {
        node.mount(element)
    }


    node.onLayoutDidUpdate(({ delta, hasLayoutChanged, snapshot }) => {
        console.log(snapshot.latestValues)
        // console.log(hasLayoutChanged)
        // hasLayoutChanged && // or existing delta is not nothing - this needs to be reinstated to fix breaking tests
        hasLayoutChanged &&
            node.setAnimationOrigin(delta, snapshot.latestValues)
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
