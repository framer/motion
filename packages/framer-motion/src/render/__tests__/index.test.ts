import { ResolvedValues, VisualElement } from "../types"
import { checkTargetForNewValues, getOrigin } from "../utils/setters"

import { MotionProps } from "../../motion/types"
import { createAnimationState } from "../utils/animation-state"
import { createBox } from "../../projection/geometry/models"
import { createHtmlRenderState } from "../html/utils/create-render-state"
import { visualElement } from "../../"

// copied straight from ../utils/__tests__/animation-state.test.ts
const stateVisualElement = visualElement<
    ResolvedValues,
    {},
    { initialState: ResolvedValues }
>({
    build() {},
    measureViewportBox: createBox,
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


describe("Unmount handling", () => {
    test("Initial animation", () => {
        const { element } = createTest()
        const motionValue = {
            stop: jest.fn(),
            get() {return 42},
            set() {},
            onChange(){ return () => 42},
            onRenderRequest(){ return () => 42},
        }
        element.addValue('some-key', motionValue as any)

        element.notifyUnmount();

        expect(motionValue.stop.mock.calls.length).toEqual(1)
    })
})
