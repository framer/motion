Undo = {}

const {
    HTMLProjectionNode,
    sync,
    buildTransform,
    animateDelta,
    addScaleCorrector,
    correctBoxShadow,
    correctBorderRadius,
    HTMLVisualElement,
} = Projection

function isAxisDeltaZero(delta) {
    return delta.translate === 0 && delta.scale === 1
}

function isDeltaZero(delta) {
    return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y)
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
Undo.createNode = (element, parent, options = {}, overrideId) => {
    const latestValues = {}
    const visualElement = new HTMLVisualElement({
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

    node.addEventListener("didUpdate", (delta) => {
        if (node.resumeFrom) {
            node.resumingFrom = node.resumeFrom
            node.resumingFrom.resumingFrom = undefined
        }

        console.log(delta)

        if (
            (node.resumeFrom && node.resumeFrom.instance) ||
            !isDeltaZero(delta)
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
