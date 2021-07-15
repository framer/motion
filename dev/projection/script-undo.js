Undo = {}

const {
    HTMLProjectionNode,
    sync,
    buildTransform,
    animateDelta,
    addScaleCorrector,
    correctBoxShadow,
    correctBorderRadius,
    htmlVisualElement,
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
    const latestValues = {}
    const visualElement = htmlVisualElement({
        visualState: {
            latestValues,
            renderState: {
                transformOrigin: {},
                transformKeys: [],
                transform: {},
                style: {},
                vars: {},
            },
        },
        // parent,
        props: {},
    })

    function scheduleRender() {
        visualElement.scheduleRender()
    }

    id++
    const node = new HTMLProjectionNode(overrideId || id, latestValues, parent)

    node.setOptions({
        onProjectionUpdate: scheduleRender,
        visualElement,
        ...options,
    })

    if (!overrideId) {
        node.mount(element)
        visualElement.projection = node
    }

    node.onLayoutDidUpdate(({ delta, hasLayoutChanged, snapshot }) => {
        // hasLayoutChanged && // or existing delta is not nothing - this needs to be reinstated to fix breaking tests
        hasLayoutChanged &&
            node.setAnimationOrigin(delta, snapshot.latestValues)
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
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
