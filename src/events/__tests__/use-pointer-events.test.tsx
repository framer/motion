import { mouseEnter, mouseLeave } from "../../../jest.setup"
import { render, fireEvent } from "react-testing-library"
import * as React from "react"
import { useRef } from "react"
import { usePointerEvents } from "../"
import { enableTouchEvents, enablePointerEvents } from "./utils/event-helpers"
import { fireCustomEvent } from "./utils/fire-event"

function testEventsWithRef(fireFunctions: { [key: string]: (element: Element) => boolean }) {
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

function testEventsWithElement(fireFunctions: { [key: string]: (element: Element) => boolean }) {
    const handlers = {}
    for (const key in fireFunctions) {
        handlers[key] = jest.fn()
    }
    const target = document.body
    const capture: { result?: any } = {}
    const Component = () => {
        capture.result = usePointerEvents(handlers, target)
        return <div />
    }
    const { rerender } = render(<Component />)
    rerender(<Component />)
    const [start, stop] = capture.result
    for (const key in fireFunctions) {
        fireFunctions[key](document.body)
        expect(handlers[key]).toHaveBeenCalledTimes(0)
        start()
        fireFunctions[key](document.body)
        expect(handlers[key]).toHaveBeenCalledTimes(1)
        fireFunctions[key](document.body)
        expect(handlers[key]).toHaveBeenCalledTimes(2)
        stop()
        fireFunctions[key](document.body)
        expect(handlers[key]).toHaveBeenCalledTimes(2)
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
        it(`should call handlers with element`, async () => {
            testEventsWithElement(touchEvents)
        })
    })
    describe("with mouse events", () => {
        it(`should call handlers with ref`, async () => {
            testEventsWithRef(mouseEvents)
        })
        it(`should call handlers with element`, async () => {
            testEventsWithElement(mouseEvents)
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
        it(`should call handlers with element`, async () => {
            testEventsWithElement(pointerEvents)
        })
    })
})
