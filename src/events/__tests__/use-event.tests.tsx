import "../../../jest.setup"
import { fireEvent, render } from "react-testing-library"
import * as React from "react"
import { useRef } from "react"
import { useEvent } from "../use-event"

describe("useEvent", () => {
    it("should call the handler when the event is fired", () => {
        const handler = jest.fn()
        const Component = () => {
            const ref = useRef(null)
            useEvent("mousedown", ref, handler)
            return <div ref={ref} />
        }
        const { container } = render(<Component />)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("should do nothing when no handler is applied", () => {})
    it("should do nothing when the ref is not filled in", () => {
        const handler = jest.fn()
        const Component = () => {
            const ref = useRef(null)
            useEvent("mousedown", ref, handler)
            return <div />
        }
        const { container } = render(<Component />)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(handler).not.toHaveBeenCalled()
    })
    describe("when an element is provided", () => {
        it("should return an start and an stop function", () => {})
        it("should should fire the event handler after the start function is called", () => {})
        it("should should not fire the event handler before the start function is called", () => {})
        it("should should stop firing the event handler after the stop function is called", () => {})
    })
})
