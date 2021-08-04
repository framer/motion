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
Animate.createNode = (
    element,
    parent,
    options = {},
    transition = { duration: 200, ease: () => 0.5 }
) => {
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
    const node = new HTMLProjectionNode(id, latestValues, parent)

    node.setOptions({
        scheduleRender: scheduleRender,
        visualElement,
        ...options,
    })

    node.mount(element)
    visualElement.projection = node

    node.addEventListener("didUpdate", ({ delta, hasLayoutChanged }) => {
        if (hasLayoutChanged) {
            node.setAnimationOrigin(delta)
            node.startAnimation(transition)
        }
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
        scheduleRender()
    }

    node.render = () => visualElement.syncRender()

    return node
}

window.Animate = Animate
