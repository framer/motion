Undo = {}

const {
    HTMLProjectionNode,
    frame,
    buildTransform,
    animateDelta,
    addScaleCorrector,
    correctBoxShadow,
    correctBorderRadius,
    HTMLVisualElement,
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
    const visualElement = new HTMLVisualElement({
        visualState: {
            latestValues,
            renderState: {
                transformOrigin: {},
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
        animate: false,
        scheduleRender: scheduleRender,
        layout: true,
        visualElement,
        ...options,
    })
    visualElement.projection = node

    if (!overrideId) {
        node.mount(element)
        visualElement.projection = node
    }

    node.addEventListener("didUpdate", ({ delta, hasLayoutChanged }) => {
        if (node.resumeFrom) {
            node.resumingFrom = node.resumeFrom
            node.resumingFrom.resumingFrom = undefined
        }
        // hasLayoutChanged && // or existing delta is not nothing - this needs to be reinstated to fix breaking tests
        if (
            (node.resumeFrom && node.resumeFrom.instance) ||
            hasLayoutChanged ||
            node.options.layoutRoot
        ) {
            node.setAnimationOrigin(delta)
        }
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
        scheduleRender()
    }

    node.render = () => visualElement.render()

    return node
}

window.Undo = Undo
