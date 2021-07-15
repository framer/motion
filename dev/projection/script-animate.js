Animate = {}

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
Animate.createNode = (element, parent, options = {}, transition = { duration: 2, ease: () => 0.5 }) => {
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
        props: {},
    })

    function scheduleRender() {
        visualElement.scheduleRender()
    }

    id++
    const node = new HTMLProjectionNode(id, latestValues, parent)

    node.setOptions({
        onProjectionUpdate: scheduleRender,
        visualElement,
        ...options,
    })


    node.mount(element)
    visualElement.projection = node

    node.onLayoutDidUpdate(({ delta, hasLayoutChanged, snapshot }) => {
        if (hasLayoutChanged) {
            node.setAnimationOrigin(delta, snapshot.latestValues)
            node.startAnimation(transition)
        }
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
        scheduleRender()
    }

    return node
}

window.Animate = Animate
