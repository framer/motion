import { render } from "../../../jest.setup"
import { fireEvent } from "@testing-library/react"
import * as React from "react"
import { useRef, useEffect } from "react"
import { useDomEvent } from "../use-dom-event"

describe("useDomEvent", () => {
    it("should handle the ref not being set correctly", () => {
        // TODO maybe show a warning too?
        const handler = jest.fn()
        const Component = () => {
            const ref = useRef(null)
            useDomEvent(ref, "mousedown", handler)
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
            useDomEvent(ref, "mousedown", handler)
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
                useDomEvent(ref, "mousedown", handler)
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
                useDomEvent(ref, "mousedown", handler)
                return <div />
            }
            const { rerender, unmount } = render(<Component />)
            rerender(<Component />)
            unmount()
            requestAnimationFrame(() => {
                fireEvent.mouseDown(document.body)
                resolve()
            })
        })
        await expect(promise).resolves.toEqual(undefined)
        expect(handler).not.toHaveBeenCalled()
    })
})
