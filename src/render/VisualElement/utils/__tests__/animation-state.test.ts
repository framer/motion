import { VisualElement } from "../.."
import { MotionProps } from "../../../../motion/types"
import { isMotionValue } from "../../../../value/utils/is-motion-value"
import { ResolvedValues } from "../../types"
import {
    AnimationState,
    AnimationType,
    createAnimationState,
} from "../animation-state"

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

    getBaseValue(key: string, props: MotionProps) {
        const style = props.style?.[key]
        return style !== undefined && !isMotionValue(style)
            ? style
            : super.getBaseValue(key, props)
    }

    readNativeValue(key: string) {
        return this.initialState[key] || 0
    }

    render() {}
}

function createTest(): { element: VisualElement; state: AnimationState } {
    const visualElement = new StateVisualElement()
    visualElement.animationState = createAnimationState(visualElement)

    return {
        element: visualElement,
        state: visualElement.animationState,
    }
}

function mockAnimate(state: AnimationState) {
    const mocked = jest.fn()
    state.setAnimateFunction(() => {
        return (animations: any) => {
            mocked(animations.map(({ animation }: any) => animation))
        }
    })
    return mocked
}

describe("Animation state - Initiating props", () => {
    test("Initial animation", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            animate: { opacity: 1 },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).toBeCalledWith([{ opacity: 1 }])
    })

    test("Initial animation with prop as variant", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            animate: "test",
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).toBeCalledWith(["test"])
    })

    test("Initial animation with prop as variant list", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            animate: ["test", "heyoo"],
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).toBeCalledWith(["test", "heyoo"])
    })

    test("Initial animation with prop as inherited variant", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps(
            {
                variants: {
                    test: { opacity: 1 },
                },
            },
            {
                animate: "test",
            }
        )

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).not.toBeCalled()
    })

    test("Initial animation with initial=false", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            initial: false,
            animate: { opacity: 1 },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).not.toBeCalled()
    })

    test("Initial animation with prop as variant with initial=false", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            initial: false,
            animate: "test",
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).not.toBeCalled()
    })

    test("Initial animation with prop as variant list with initial=false", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            initial: false,
            animate: ["test", "heyoo"],
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(animate).not.toBeCalled()
    })
})

describe("Animation state - Setting props", () => {
    test("No change, target", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: 1 },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: 1 },
        })

        expect(animate).not.toBeCalled()
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({
            opacity: true,
        })
    })

    test("No change, variant", () => {
        const { state } = createTest()

        state.setProps({
            animate: "test",
            variants: {
                test: { opacity: 1 },
            },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: "test",
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(animate).not.toBeCalled()
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({
            opacity: true,
        })
    })

    test("No change, variant list", () => {
        const { state } = createTest()

        state.setProps({
            animate: ["test", "test2"],
            variants: {
                test: { opacity: 1 },
            },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: ["test", "test2"],
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(animate).not.toBeCalled()
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({
            opacity: true,
        })
    })

    test("Change single value, target", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: 1 },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: 0 },
        })

        expect(animate).toBeCalledWith([{ opacity: 0 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Change single value, variant", () => {
        const { state } = createTest()

        state.setProps({
            animate: "a",
            variants: {
                a: { opacity: 0 },
                b: { opacity: 1 },
            },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: "b",
            variants: {
                a: { opacity: 0 },
                b: { opacity: 1 },
            },
        })

        expect(animate).toBeCalledWith(["b"])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Change single value, variant list", () => {
        const { state } = createTest()

        state.setProps({
            animate: ["a"],
            variants: {
                a: { opacity: 0 },
                b: { opacity: 1 },
            },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: ["b"],
            variants: {
                a: { opacity: 0 },
                b: { opacity: 1 },
            },
        })

        expect(animate).toBeCalledWith(["b"])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Swap between value in target and transitionEnd, target", () => {
        const { state } = createTest()

        state.setProps({
            style: { opacity: 0.1 },
            animate: { opacity: 0.2 },
        })

        let animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 0.1 },
            animate: { transitionEnd: { opacity: 0.3 } },
        })

        expect(animate).toBeCalledWith([{ transitionEnd: { opacity: 0.3 } }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})

        animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 0.1 },
            animate: { opacity: 0.2 },
        })
        expect(animate).toBeCalledWith([{ opacity: 0.2 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Change single value, target, with unchanging values", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: 1, x: 0 },
        })

        let animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: 0, x: 0 },
        })

        expect(animate).toBeCalledWith([{ opacity: 0, x: 0 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({
            x: true,
        })

        animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: 0, x: 100 },
        })

        expect(animate).toBeCalledWith([{ opacity: 0, x: 100 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({
            opacity: true,
        })
    })

    test("Removing values, target changed", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: 1 },
        })

        const animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 0 },
            animate: {},
        })

        expect(animate).toBeCalledWith([{ opacity: 0 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Removing values, target undefined", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: 1 },
        })

        const animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 0 },
            animate: undefined,
        })

        expect(animate).toBeCalledWith([{ opacity: 0 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Removing values, variant changed", () => {
        const { state } = createTest()

        state.setProps({
            animate: "a",
            variants: {
                a: { opacity: 0 },
                b: { x: 1 },
            },
        })

        const animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 1 },
            animate: "b",
            variants: {
                a: { opacity: 0 },
                b: { x: 1 },
            },
        })

        expect(animate).toBeCalledWith(["b", { opacity: 1 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Removing values, inherited variant changed", () => {
        const { state } = createTest()

        state.setProps(
            {
                variants: {
                    a: { opacity: 0 },
                    b: { x: 1 },
                },
            },
            { animate: "a" }
        )

        const animate = mockAnimate(state)

        state.setProps(
            {
                style: { opacity: 1 },
                variants: {
                    a: { opacity: 0 },
                    b: { x: 1 },
                },
            },
            { animate: "b" }
        )

        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })
})

describe("Animation state - Set active", () => {
    test("Change active state while props are the same", () => {
        const { state } = createTest()

        state.setProps({
            style: { opacity: 0 },
            animate: { opacity: 1 },
            whileHover: { opacity: 0.5 },
            whileTap: { opacity: 0.8 },
        })

        // Set hover to true
        let animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith([{ opacity: 0.5 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set hover to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith([{ opacity: 0.5 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set hover to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith([{ opacity: 0.5 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set press to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Tap, true)
        expect(animate).toBeCalledWith([{ opacity: 0.8 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Hover)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Tap)).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(state.getProtectedKeys(AnimationType.Animate)).toHaveProperty(
            "opacity"
        )
        expect(state.getProtectedKeys(AnimationType.Tap)).toHaveProperty(
            "opacity"
        )
        expect(animate).not.toBeCalled()

        // Set press to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Tap, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
    })

    test("Change active variant where no variants are defined", () => {
        /**
         * We should still animate back to lower-priority variants in case children need animating to
         */
        const { state } = createTest()

        state.setProps({
            animate: "a",
            whileHover: "b",
        })

        // Set hover to true
        let animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith(["b"])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith(["a"])
        expect(state.getProtectedKeys(AnimationType.Animate)).toEqual({})
        expect(state.getProtectedKeys(AnimationType.Hover)).toEqual({})
    })
})
