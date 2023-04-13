Animate = {}

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
Animate.createNode = (
    element,
    parent,
    options = {},
    transition = { duration: 10, ease: () => 0.5 }
) => {
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
    const node = new HTMLProjectionNode(id, latestValues, parent)

    node.setOptions({
        scheduleRender: scheduleRender,
        visualElement,
        layout: true,
        ...options,
    })

    node.mount(element)
    visualElement.projection = node

    node.addEventListener("didUpdate", ({ delta, hasLayoutChanged }) => {
        if (node.resumeFrom) {
            node.resumingFrom = node.resumeFrom
            node.resumingFrom.resumingFrom = undefined
        }
        if (hasLayoutChanged) {
            node.setAnimationOrigin(delta)
            node.startAnimation(transition)
        }
    })

    node.setValue = (key, value) => {
        latestValues[key] = value
        scheduleRender()
    }

    node.render = () => visualElement.render()

    return node
}

Animate.relativeEase = () => {
    let frameCount = 0
    return (t) => {
        frameCount++
        // one frame for the first synchronous call of mixTargetDelta at the very start,
        // don't lock it to 0.5 otherwise the relative boxes can't be measure correctly.
        // Then the first animation frame when we resolve relative delta,
        // and then finally the first relative frame.
        return frameCount >= 2 ? (t === 1 || t === 0 ? t : 0.5) : 0
    }
}

window.Animate = Animate
