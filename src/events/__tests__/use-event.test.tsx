import "../../../jest.setup"
import { fireEvent, render } from "react-testing-library"
import * as React from "react"
import { useRef, useEffect } from "react"
import { useEvent } from "../"

describe("useEvent", () => {
    it("should handle the ref not being set correctly", () => {
        // TODO maybe show a warning too?
        const handler = jest.fn()
        const Component = () => {
            const ref = useRef(null)
            useEvent("mousedown", ref, handler)
            return <div />
        }
        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(handler).not.toHaveBeenCalled()
    })
    it("should call the handler when the event is fired", () => {
        const handler = jest.fn()
        const Component = () => {
            const ref = useRef(null)
            useEvent("mousedown", ref, handler)
            return <div ref={ref} />
        }
        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("should fire an event on another element in the ref", async () => {
        const handler = jest.fn()
        const promise = new Promise(resolve => {
            const Component = () => {
                const ref = useRef(document.body)
                useEvent("mousedown", ref, handler)
                useEffect(resolve)
                return <div />
            }
            const { rerender } = render(<Component />)
            rerender(<Component />)
            fireEvent.mouseDown(document.body)
        })
        await expect(promise).resolves.toEqual(undefined)
        expect(handler).toHaveBeenCalled()
    })
    it("should not fire an event if the component has been unmounted", async () => {
        const handler = jest.fn()
        const promise = new Promise(resolve => {
            const Component = () => {
                const ref = useRef(document.body)
                useEvent("mousedown", ref, handler)
                useEffect(resolve)
                return <div />
            }
            const { rerender, unmount } = render(<Component />)
            rerender(<Component />)
            unmount()
            fireEvent.mouseDown(document.body)
        })
        await expect(promise).resolves.toEqual(undefined)
        expect(handler).not.toHaveBeenCalled()
    })

    describe("when an element is provided", () => {
        const target = document.body
        it("should return an start and an stop function", () => {
            const handler = jest.fn()
            const capture: { result?: any } = {}
            const Component = () => {
                capture.result = useEvent("mousedown", target, handler)
                return <div />
            }
            render(<Component />)
            const [start, stop] = capture.result
            expect(start).toBeInstanceOf(Function)
            expect(stop).toBeInstanceOf(Function)
        })
        it("should should fire the event handler after the start function is called", () => {
            const handler = jest.fn()
            const capture: { result?: any } = {}
            const Component = () => {
                capture.result = useEvent("mousedown", target, handler)
                return <div />
            }
            render(<Component />)
            const [start] = capture.result
            start()
            fireEvent.mouseDown(document.body)
            expect(handler).toHaveBeenCalledTimes(1)
            fireEvent.mouseDown(document.body)
            expect(handler).toHaveBeenCalledTimes(2)
        })
        it("should should not fire the event handler before the start function is called", () => {
            const handler = jest.fn()
            const Component = () => {
                useEvent("mousedown", target, handler)
                return <div />
            }
            render(<Component />)
            fireEvent.mouseDown(document.body)
            expect(handler).not.toHaveBeenCalled()
        })
        it("should should stop firing the event handler after the stop function is called", () => {
            const handler = jest.fn()
            const capture: { result?: any } = {}
            const Component = () => {
                capture.result = useEvent("mousedown", target, handler)
                return <div />
            }
            render(<Component />)
            const [start, stop] = capture.result
            start()
            fireEvent.mouseDown(document.body)
            expect(handler).toHaveBeenCalledTimes(1)
            stop()
            fireEvent.mouseDown(document.body)
            expect(handler).toHaveBeenCalledTimes(1)
        })
        it("should return undefined when no handler is provided", () => {
            const capture: { result?: any } = { result: "bla" }
            const Component = () => {
                capture.result = useEvent("mousedown", target)
                return <div />
            }
            render(<Component />)
            expect(capture.result).toBe(undefined)
        })
    })
})
