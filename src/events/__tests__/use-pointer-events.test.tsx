import { mouseEnter, mouseLeave } from "../../../jest.setup"
import { render, fireEvent } from "react-testing-library"
import * as React from "react"
import { useRef } from "react"
import { usePointerEvents } from "../"
import { PointerEventHandlers } from "../use-pointer-events"
import { enableTouch, enablePointer } from "./utils/event-helpers"
import { fireCustomEvent } from "./utils/fire-event"

function testEvents(name: string, fireFunction: (element: Element) => boolean) {
    const handler = jest.fn()
    const handlers: Partial<PointerEventHandlers> = {}
    handlers[name] = handler
    const Component = () => {
        const ref = useRef(null)
        usePointerEvents(handlers, ref)
        return <div ref={ref} />
    }
    const { container, rerender } = render(<Component />)
    rerender(<Component />)
    fireFunction(container.firstChild as Element)
    expect(handler).toHaveBeenCalledTimes(1)
}

const touchHandlers = {
    onPointerDown: fireEvent.touchStart,
    onPointerMove: fireEvent.touchMove,
    onPointerUp: fireEvent.touchEnd,
    onPointerCancel: fireEvent.touchCancel,
}

const mouseHandlers = {
    onPointerDown: fireEvent.mouseDown,
    onPointerMove: fireEvent.mouseMove,
    onPointerUp: fireEvent.mouseUp,
    onPointerOver: fireEvent.mouseOver,
    onPointerOut: fireEvent.mouseOut,
    onPointerEnter: mouseEnter,
    onPointerLeave: mouseLeave,
}

const pointerHandlers = {
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
    describe("on touch devices", () => {
        for (const key in touchHandlers) {
            it(`should call ${key} handler`, () => {
                const restore = enableTouch()
                testEvents(key, touchHandlers[key])
                restore()
            })
        }
    })
    describe("on mouse devices", () => {
        for (const key in mouseHandlers) {
            it(`should call ${key} handler`, () => {
                testEvents(key, mouseHandlers[key])
            })
        }
    })
    describe.skip("on pointer devices", () => {
        for (const key in pointerHandlers) {
            it(`should call ${key} handler`, () => {
                const restore = enablePointer()
                testEvents(key, pointerHandlers[key])
                restore()
            })
        }
    })
})
