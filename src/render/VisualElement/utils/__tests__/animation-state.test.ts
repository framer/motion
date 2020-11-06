import { VisualElement } from "../.."
import { ResolvedValues } from "../../types"
import { AnimationType, createAnimationState } from "../animation-state"

class StateVisualElement extends VisualElement {
    initialState: ResolvedValues = {}

    updateLayoutDelta() {}

    build() {}

    clean() {}

    makeTargetAnimatable(target: any) {
        return target
    }

    getBoundingBox() {
        return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }
    }

    readNativeValue(key: string) {
        return this.initialState[key] || 0
    }

    render() {}
}

let count = 0
function createTest() {
    console.log(count, "Test =========")
    count++

    const visualElement = new StateVisualElement()
    visualElement.animationState = createAnimationState(visualElement)
    visualElement.animate = jest.fn()
    return visualElement
}

describe("Animation state - Animate prop only.", () => {
    test("Initial animation: animate prop", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { opacity: 1 },
        })

        expect(element.animate).toBeCalledWith([{ opacity: 1 }])
    })

    test("Initial animation: animate as variant", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: "test",
            variants: { test: { opacity: 1 } },
        })

        expect(element.animate).toBeCalledWith(["test"])
    })

    test("Initial animation: initial false", () => {
        const element = createTest()

        element.animationState!.setProps({
            initial: false,
            animate: { opacity: 1 },
        })

        expect(element.animate).not.toBeCalled()
    })

    test("Prop change: Like for like", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }])
        element.animate = jest.fn()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).not.toBeCalled()
        element.animate = jest.fn()

        element.animationState!.setProps({
            animate: { x: 2 },
        })

        expect(element.animate).toBeCalledWith([{ x: 2 }])
    })

    test("Prop change: Removing values", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }])
        element.animate = jest.fn()

        element.animationState!.setProps({
            style: { x: 0 },
            animate: { opacity: 1 },
        })

        expect(element.animate).toBeCalledWith([{ opacity: 1 }, { x: 0 }])
        element.animate = jest.fn()

        element.animationState!.setProps({
            animate: { x: 2 },
        })

        expect(element.animate).toBeCalledWith([{ x: 2 }, { opacity: 0 }])
    })

    test("Prop change: Removing prop", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }])

        element.animationState!.setProps({})

        expect(element.animate).toBeCalledWith([{ x: 0 }])
    })
})

describe("Animation state - Active states", () => {
    test("Setting active state with consistent props", () => {
        const element = createTest()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
        })
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setActive(AnimationType.Hover, false)
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setActive(AnimationType.Press, true)
        element.animationState!.setActive(AnimationType.Hover, false)
        element.animationState!.setActive(AnimationType.Press, false)
        expect(element.animate).toBeCalledWith(
            [{ opacity: 1 }], // initial
            [{ opacity: 0.5 }], // hover true
            [{ opacity: 1 }], // hover false
            [{ opacity: 0.5 }], // hover true
            [{ opacity: 0.8 }], // press true
            // hover false - no animation
            [{ opacity: 1 }] // press false
        )
    })
    test("Setting active state with some variants", () => {
        const element = createTest()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: "test",
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
            variants: { test: { opacity: 1 } },
        })
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setActive(AnimationType.Hover, false)
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setActive(AnimationType.Press, true)
        element.animationState!.setActive(AnimationType.Hover, false)
        element.animationState!.setActive(AnimationType.Press, false)
        expect(element.animate).toBeCalledWith(
            [{ opacity: 1 }], // initial
            [{ opacity: 0.5 }], // hover true
            [{ opacity: 1 }], // hover false
            [{ opacity: 0.5 }], // hover true
            [{ opacity: 0.8 }], // press true
            // hover false - no animation
            [{ opacity: 1 }] // press false
        )
    })
    test("Setting props while props are active", () => {
        const element = createTest()
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: { opacity: 1, x: 100 },
            whileHover: { opacity: 0.5 },
        })
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: { opacity: 1, x: 50 },
            whileHover: { opacity: 0.8 },
        })
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: { x: 50 },
            whileHover: undefined,
        })
        expect(element.animate).toBeCalledWith(
            [{ opacity: 1, x: 100 }], // initial
            [{ opacity: 0.5 }], // hover: true
            [{ opacity: 0.8 }, { x: 50 }], // set props
            [{ opacity: 0 }] // set props
        )
    })
    test("Setting props while props are active with some variants", () => {
        const element = createTest()
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: "test",
            whileHover: "hover",
            variants: { test: { opacity: 1, x: 100 }, hover: { opacity: 0.5 } },
        })
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: "test",
            whileHover: "hover",
            variants: { test: { opacity: 1, x: 50 }, hover: { opacity: 0.8 } },
        })
        element.animationState!.setProps({
            style: { opacity: 0, x: 0 },
            animate: "test",
            whileHover: "hover",
            variants: { test: { x: 50 } },
        })
        expect(element.animate).toBeCalledWith(
            [{ opacity: 1, x: 100 }], // initial
            [{ opacity: 0.5 }], // hover: true
            [{ opacity: 0.8 }, { x: 50 }], // set props
            [{ opacity: 0 }] // set props
        )
    })
})

describe("Animation state - Variant propagation", () => {})
