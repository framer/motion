import { motionValue } from "../../../value"
import { updateMotionValuesFromProps } from "../motion-values"

function createElement(key: string, prevStyle: { [key: string]: any }) {
    const value = motionValue("rgb(255, 0, 0)")
    value.liveStyle = true
    value.jump = jest.fn()
    return {
        value,
        element: {
            prevProps: { style: prevStyle },
            hasValue: (k: string) => k === key,
            getValue: () => value,
            removeValue: jest.fn(),
        },
    }
}

describe("updateMotionValuesFromProps", () => {
    test("doesn't jump a value handed back from animation state when its style value is unchanged", () => {
        /**
         * Found while investigating #2369. The value wasn't scraped before
         * animation state handed it back, so it's missing from prev.
         */
        const style = { backgroundColor: "rgb(0, 0, 255)" }
        const { element, value } = createElement("backgroundColor", style)

        updateMotionValuesFromProps(element, style, {})

        expect(value.jump).not.toHaveBeenCalled()
    })

    test("jumps a value handed back from animation state when its style value changes", () => {
        const { element, value } = createElement("backgroundColor", {
            backgroundColor: "rgb(0, 0, 255)",
        })

        updateMotionValuesFromProps(
            element,
            { backgroundColor: "rgb(0, 128, 0)" },
            { backgroundColor: "rgb(0, 0, 255)" }
        )

        expect(value.jump).toHaveBeenCalledWith("rgb(0, 128, 0)")
    })
})
