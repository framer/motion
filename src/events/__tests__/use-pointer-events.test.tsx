import { mouseEnter, mouseLeave } from "../../../jest.setup"
import { render, fireEvent } from "react-testing-library"
import * as React from "react"
import { useRef } from "react"
import { usePointerEvents } from "../"
import { enableTouchEvents, enablePointerEvents } from "./utils/event-helpers"
import { fireCustomEvent } from "./utils/fire-event"

function testEvents(fireFunctions: { [key: string]: (element: Element) => boolean }) {
    const handlers = {}
    for (const key in fireFunctions) {
        handlers[key] = jest.fn()
    }
    const Component = () => {
        const ref = useRef(null)
        usePointerEvents(handlers, ref)
        return <div ref={ref} />
    }
    const { container, rerender } = render(<Component />)
    rerender(<Component />)
    for (const key in fireFunctions) {
        expect(handlers[key]).toHaveBeenCalledTimes(0)
        fireFunctions[key](container.firstChild as Element)
        expect(handlers[key]).toHaveBeenCalledTimes(1)
    }
}

const touchEvents = {
    onPointerDown: fireEvent.touchStart,
    onPointerMove: fireEvent.touchMove,
    onPointerUp: fireEvent.touchEnd,
    onPointerCancel: fireEvent.touchCancel,
}

const mouseEvents = {
    onPointerDown: fireEvent.mouseDown,
    onPointerMove: fireEvent.mouseMove,
    onPointerUp: fireEvent.mouseUp,
    onPointerOver: fireEvent.mouseOver,
    onPointerOut: fireEvent.mouseOut,
    onPointerEnter: mouseEnter,
    onPointerLeave: mouseLeave,
}

const pointerEvents = {
    onPointerDown: fireCustomEvent("pointerdown"),
    onPointerMove: fireCustomEvent("pointermove"),
    onPointerUp: fireCustomEvent("pointerup"),
    onPointerCancel: fireCustomEvent("pointercancel"),
    onPointerOver: fireCustomEvent("pointerover"),
    onPointerOut: fireCustomEvent("pointerout"),
    onPointerEnter: fireCustomEvent("pointerenter"),
    onPointerLeave: fireCustomEvent("pointerleave"),
}

describe("usePointerEvents", () => {
    it(`should call touch handlers`, async () => {
        const restore = enableTouchEvents()
        testEvents(touchEvents)
        restore()
    })
    it(`should call mouse handlers`, () => {
        testEvents(mouseEvents)
    })
    it(`should call pointer handlers`, () => {
        const restore = enablePointerEvents()
        testEvents(pointerEvents)
        restore()
    })
})
