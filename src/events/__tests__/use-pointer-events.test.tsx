import { mouseEnter, mouseLeave, render } from "../../../jest.setup"
import { fireEvent } from "@testing-library/dom"
import * as React from "react"
import { usePointerEvent } from "../use-pointer-event"
import { enableTouchEvents, enablePointerEvents } from "./utils/event-helpers"
import { fireCustomEvent } from "./utils/fire-event"

function testEventsWithRef(fireFunctions: {
    [key: string]: (element: Element) => void
}) {
    const ref = React.createRef<HTMLDivElement>()
    const handlers = {}
    for (const key in fireFunctions) {
        handlers[key] = jest.fn()
    }
    const Component = () => {
        for (const key in fireFunctions) {
            usePointerEvent(ref, key, handlers[key])
        }

        return <div ref={ref} />
    }
    const { rerender } = render(<Component />)
    rerender(<Component />)

    for (const key in fireFunctions) {
        expect(handlers[key]).toHaveBeenCalledTimes(0)
        fireFunctions[key](ref.current as HTMLDivElement)
        expect(handlers[key]).toHaveBeenCalledTimes(1)
    }
}

const touchEvents = {
    pointerdown: fireEvent.touchStart,
    pointermove: fireEvent.touchMove,
    pointerup: fireEvent.touchEnd,
    pointercancel: fireEvent.touchCancel,
}

const mouseEvents = {
    pointerdown: fireEvent.mouseDown,
    pointermove: fireEvent.mouseMove,
    pointerup: fireEvent.mouseUp,
    pointerover: fireEvent.mouseOver,
    pointerout: fireEvent.mouseOut,
    pointerenter: mouseEnter,
    pointerleave: mouseLeave,
}

const pointerEvents = {
    pointerdown: fireCustomEvent("pointerdown"),
    pointermove: fireCustomEvent("pointermove"),
    pointerup: fireCustomEvent("pointerup"),
    pointercancel: fireCustomEvent("pointercancel"),
    pointerover: fireCustomEvent("pointerover"),
    pointerout: fireCustomEvent("pointerout"),
    pointerenter: fireCustomEvent("pointerenter"),
    pointerleave: fireCustomEvent("pointerleave"),
}

describe("usePointerEvents", () => {
    describe("with touch events", () => {
        let restore: Function
        beforeAll(() => {
            restore = enableTouchEvents()
        })
        afterAll(() => {
            restore()
        })
        it(`should call handlers with ref`, async () => {
            testEventsWithRef(touchEvents)
        })
    })
    describe("with mouse events", () => {
        it(`should call handlers with ref`, async () => {
            testEventsWithRef(mouseEvents)
        })
    })
    describe("with pointer events", () => {
        let restore: Function
        beforeAll(() => {
            restore = enablePointerEvents()
        })
        afterAll(() => {
            restore()
        })
        it(`should call handlers with ref`, async () => {
            testEventsWithRef(pointerEvents)
        })
    })
})
