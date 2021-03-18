import { axisBox } from "../../../utils/geometry"
import { ResolvedValues, VisualElement } from "../../types"
import { AnimationState, createAnimationState } from "../animation-state"
import { AnimationType } from "../types"
import { checkTargetForNewValues, getOrigin } from "../setters"
import { visualElement } from "../../"
import { MotionProps } from "../../../motion"
import { createHtmlRenderState } from "../../html/utils/create-render-state"

const stateVisualElement = visualElement<
    ResolvedValues,
    {},
    { initialState: ResolvedValues }
>({
    build() {},
    measureViewportBox: axisBox,
    resetTransform() {},
    restoreTransform() {},
    removeValueFromRenderState() {},
    render() {},
    scrapeMotionValuesFromProps() {
        return {}
    },

    getBaseTarget(props, key) {
        return props.style?.[key]
    },

    readValueFromInstance(_state, key, options) {
        return options.initialState[key] || 0
    },

    makeTargetAnimatable(element, { transition, transitionEnd, ...target }) {
        const origin = getOrigin(target as any, transition || {}, element)
        checkTargetForNewValues(element, target, origin as any)
        return { transition, transitionEnd, ...target }
    },
})

function createTest(
    props: MotionProps = {},
    parent: VisualElement<any> | undefined = undefined
): { element: VisualElement; state: any } {
    const element = stateVisualElement(
        {
            props,
            parent,
            visualState: {
                latestValues: {},
                renderState: createHtmlRenderState(),
            },
        },
        {
            initialState: {},
        }
    )
    element.animationState = createAnimationState(element)

    element.mount({})

    return {
        element: element,
        state: {
            ...element.animationState,
            setProps(
                newProps: any,
                options: any,
                type: any,
                animateChanges = true
            ): any {
                element.setProps(newProps)
                return animateChanges === true
                    ? element.animationState?.animateChanges(options, type)
                    : undefined
            },
        },
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

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(animate).toBeCalledWith(["test", "heyoo"])
    })

    test("Initial animation with prop as inherited variant", () => {
        const { element: parent } = createTest({
            animate: "test",
        })
        const { element: child, state } = createTest({}, parent)
        child.manuallyAnimateOnMount = false

        const animate = mockAnimate(state)
        state.setProps({
            variants: {
                test: { opacity: 1 },
            },
        })

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(animate).not.toBeCalled()
    })

    test("Initial animation with initial=false", () => {
        const { state } = createTest()

        const animate = mockAnimate(state)
        state.setProps({
            initial: false,
            animate: { opacity: 1 },
        })

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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

        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
            opacity: true,
        })
    })
    test("No change, target keyframes", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: [0, 1] },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: [0, 1] },
        })

        expect(animate).not.toBeCalled()
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
    })

    test("Change single value, keyframes", () => {
        const { state } = createTest()

        state.setProps({
            animate: { opacity: [0, 1] },
        })

        const animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: [0.5, 1] },
        })

        expect(animate).toBeCalledWith([{ opacity: [0.5, 1] }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )

        animate = mockAnimate(state)

        state.setProps({
            style: { opacity: 0.1 },
            animate: { opacity: 0.2 },
        })
        expect(animate).toBeCalledWith([{ opacity: 0.2 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
            x: true,
        })

        animate = mockAnimate(state)

        state.setProps({
            animate: { opacity: 0, x: 100 },
        })

        expect(animate).toBeCalledWith([{ opacity: 0, x: 100 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual({
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
    })

    test("Removing values, inherited variant changed", () => {
        const { element: parent } = createTest({ animate: "a" })
        const { state } = createTest({}, parent)

        state.setProps({
            variants: {
                a: { opacity: 0 },
                b: { x: 1 },
            },
        })

        const animate = mockAnimate(state)
        parent.setProps({ animate: "b" })
        state.setProps({
            style: { opacity: 1 },
            variants: {
                a: { opacity: 0 },
                b: { x: 1 },
            },
        })

        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
    })

    test("Removing values, inherited variant changed from starting at empty variant", () => {
        const { element: parent, state: parentState } = createTest({
            animate: "",
        })
        const { element: child, state: childState } = createTest({}, parent)
        child.manuallyAnimateOnMount = false
        childState.setProps(
            {
                style: { opacity: 0 },
                variants: {
                    a: { opacity: 0.1 },
                    b: { opacity: 0.9 },
                },
            },
            undefined,
            undefined,
            false
        )

        let parentAnimate = mockAnimate(parentState)
        let childAnimate = mockAnimate(childState)

        childState.setProps(
            {
                style: { opacity: 0 },
                variants: {
                    a: { opacity: 0.1 },
                    b: { opacity: 0.9 },
                },
            },
            undefined,
            undefined,
            false
        )
        parentState.setProps({ animate: "a" }, undefined, undefined, false)
        child.animationState!.animateChanges()
        parent.animationState!.animateChanges()

        expect(parentAnimate).toBeCalledWith(["a"])
        expect(childAnimate).not.toBeCalled()
        expect(
            childState.getState()[AnimationType.Animate].protectedKeys
        ).toEqual({})

        parentAnimate = mockAnimate(parentState)
        childAnimate = mockAnimate(childState)

        childState.setProps(
            {
                style: { opacity: 0 },
                variants: {
                    a: { opacity: 0.1 },
                    b: { opacity: 0.9 },
                },
            },
            undefined,
            undefined,
            false
        )
        parentState.setProps({ animate: "b" }, undefined, undefined, false)

        child.animationState!.animateChanges()
        parent.animationState!.animateChanges()
        expect(parentAnimate).toBeCalledWith(["b"])
        expect(childAnimate).not.toBeCalled()
        expect(
            childState.getState()[AnimationType.Animate].protectedKeys
        ).toEqual({})

        parentAnimate = mockAnimate(parentState)
        childAnimate = mockAnimate(childState)

        childState.setProps(
            {
                style: { opacity: 0 },
                variants: {
                    a: { opacity: 0.1 },
                    b: { opacity: 0.9 },
                },
            },
            undefined,
            undefined,
            false
        )
        parentState.setProps({ animate: "" }, undefined, undefined, false)

        child.animationState!.animateChanges()
        parent.animationState!.animateChanges()
        expect(parentAnimate).toBeCalledWith([""])
        expect(childAnimate).toBeCalledWith([{ opacity: 0 }])
        expect(
            childState.getState()[AnimationType.Animate].protectedKeys
        ).toEqual({})
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
        expect(
            state.getState()[AnimationType.Animate].protectedKeys
        ).toHaveProperty("opacity")
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set hover to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith([{ opacity: 0.5 }])
        expect(
            state.getState()[AnimationType.Animate].protectedKeys
        ).toHaveProperty("opacity")
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set hover to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, true)
        expect(animate).toBeCalledWith([{ opacity: 0.5 }])
        expect(
            state.getState()[AnimationType.Animate].protectedKeys
        ).toHaveProperty("opacity")
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set press to true
        animate = mockAnimate(state)
        state.setActive(AnimationType.Tap, true)
        expect(animate).toBeCalledWith([{ opacity: 0.8 }])
        expect(
            state.getState()[AnimationType.Animate].protectedKeys
        ).toHaveProperty("opacity")
        expect(
            state.getState()[AnimationType.Hover].protectedKeys
        ).toHaveProperty("opacity")
        expect(state.getState()[AnimationType.Tap].protectedKeys).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(
            state.getState()[AnimationType.Animate].protectedKeys
        ).toHaveProperty("opacity")
        expect(
            state.getState()[AnimationType.Tap].protectedKeys
        ).toHaveProperty("opacity")
        expect(animate).not.toBeCalled()

        // Set press to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Tap, false)
        expect(animate).toBeCalledWith([{ opacity: 1 }])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
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
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})

        // Set hover to false
        animate = mockAnimate(state)
        state.setActive(AnimationType.Hover, false)
        expect(animate).toBeCalledWith(["a"])
        expect(state.getState()[AnimationType.Animate].protectedKeys).toEqual(
            {}
        )
        expect(state.getState()[AnimationType.Hover].protectedKeys).toEqual({})
    })
})
