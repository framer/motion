Animate = {}

const {
    HTMLProjectionNode,
    sync,
    buildTransform,
    animateDelta,
    addScaleCorrector,
    correctBoxShadow,
    correctBorderRadius,
} = Projection

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
Animate.createNode = (element, parent, options = {}) => {
    const latestValues = {}

    function render() {
        Object.assign(
            element.style,
            {
                transform: buildTransform(
                    {
                        transform: defaultValueType(latestValues),
                        transformKeys: Object.keys(latestValues),
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

    const node = new HTMLProjectionNode(id, latestValues, parent)
    node.mount(element)
    node.setOptions({
        onProjectionUpdate: scheduleRender,
        ...options,
    })

    node.onLayoutDidUpdate(({ delta, hasLayoutChanged, snapshot }) => {
        if (hasLayoutChanged) {
            node.setAnimationOrigin(delta, snapshot.latestValues)
            node.startAnimation({ duration: 2, ease: () => 0.5 })
        }
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
        scheduleRender()
    }

    return node
}

window.Animate = Animate
