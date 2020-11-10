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

        expect(element.animate).toBeCalledWith([{ opacity: 1 }], new Set())
    })

    test("Initial animation: animate as variant", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: "test",
            variants: { test: { opacity: 1 } },
        })

        expect(element.animate).toBeCalledWith([{ opacity: 1 }], new Set())
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

        expect(element.animate).toBeCalledWith([{ x: 1 }], new Set())

        element.animate = jest.fn()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).not.toBeCalled()
        element.animate = jest.fn()

        element.animationState!.setProps({
            animate: { x: 2 },
        })

        expect(element.animate).toBeCalledWith([{ x: 2 }], new Set())
    })

    test("Prop change: Variants", () => {
        const element = createTest()

        element.animationState!.setProps({
            variants: { a: { x: 1 }, b: { y: 2 } },
            animate: ["a", "b"],
        })
        expect(element.animate).toBeCalledWith([{ y: 2 }, { x: 1 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setProps({
            variants: { a: { x: 2 }, b: { y: 3 } },
            animate: ["a", "b"],
        })
        expect(element.animate).toBeCalledWith([{ y: 3 }, { x: 2 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setProps({
            variants: { a: { x: 2 }, b: { y: 3 }, c: { y: 4 } },
            animate: ["a", "c"],
        })
        expect(element.animate).toBeCalledWith([{ y: 4 }, { x: 2 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { x: 0 },
            variants: { c: { y: 4 } },
            animate: ["a", "c"],
        })
        expect(element.animate).toBeCalledWith([{ y: 4 }, { x: 0 }], new Set())
    })

    test("Prop change: Removing values", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }], new Set())
        element.animate = jest.fn()

        element.animationState!.setProps({
            style: { x: 0 },
            animate: { opacity: 1 },
        })

        expect(element.animate).toBeCalledWith(
            [{ opacity: 1 }, { x: 0 }],
            new Set()
        )
        element.animate = jest.fn()
        element.baseTarget.opacity = 0
        element.animationState!.setProps({
            animate: { x: 2 },
        })

        expect(element.animate).toBeCalledWith(
            [{ x: 2 }, { opacity: 0 }],
            new Set()
        )
    })

    test("Prop change: Removing prop => baseTarget", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }], new Set())

        element.baseTarget.x = 0
        element.animationState!.setProps({})

        expect(element.animate).toBeCalledWith([{ x: 0 }], new Set())
    })

    test("Prop change: Removing prop => style", () => {
        const element = createTest()

        element.animationState!.setProps({
            animate: { x: 1 },
        })

        expect(element.animate).toBeCalledWith([{ x: 1 }], new Set())

        element.animationState!.setProps({ style: { x: 0 } })

        expect(element.animate).toBeCalledWith([{ x: 0 }], new Set())
    })
})

describe("Animation state - Active states", () => {
    test("Changing active state while props are the same", () => {
        const element = createTest()

        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
        })
        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, true)
        expect(element.animate).toBeCalledWith([{ opacity: 0.5 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, false)
        expect(element.animate).toBeCalledWith([{ opacity: 1 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, true)
        expect(element.animate).toBeCalledWith([{ opacity: 0.5 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, false)
        expect(element.animate).toBeCalledWith([{ opacity: 1 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, true)
        expect(element.animate).toBeCalledWith([{ opacity: 0.5 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Press, true)
        expect(element.animate).toBeCalledWith([{ opacity: 0.8 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Hover, false)
        expect(element.animate).not.toBeCalledWith()

        element.animate = jest.fn()
        element.animationState!.setActive(AnimationType.Press, false)
        expect(element.animate).toBeCalledWith([{ opacity: 1 }], new Set())
    })

    test("Changing props while higher priorities are active", () => {
        const element = createTest()

        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
        })
        element.animationState!.setActive(AnimationType.Hover, true)
        element.animationState!.setActive(AnimationType.Press, true)

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: undefined,
            whileTap: { opacity: 0.8 },
        })
        expect(element.animate).not.toBeCalled()

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
        })
        expect(element.animate).not.toBeCalled()

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.9 },
        })
        expect(element.animate).toBeCalledWith([{ opacity: 0.9 }], new Set())

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { x: 50, opacity: 1 },
            whileHover: { x: 100, opacity: 0.5 },
            whileTap: { opacity: 0.9 },
        })
        expect(element.animate).toBeCalledWith(
            [{ x: 100, opacity: 0.5 }],
            new Set(["opacity"])
        )

        element.animate = jest.fn()
        element.animationState!.setProps({
            style: { opacity: 0 },
            animate: { x: 50, opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.9 },
        })
        expect(element.animate).toBeCalledWith(
            [{ x: 50, opacity: 1 }],
            new Set(["opacity"])
        )
    })
})

describe("Animation state - Variant propagation", () => {
    // 1. initial render gets correct props
    // 2.
})
