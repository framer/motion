import "@testing-library/jest-dom"
// Get fireEvent from the native testing library
// because @testing-library/react one switches out pointerEnter and pointerLeave
import { fireEvent, getByTestId } from "@testing-library/dom"
import { render as testRender, act } from "@testing-library/react"
import * as React from "react"

// Stub ResizeObserver
if (!(global as any).ResizeObserver) {
    ;(global as any).ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as any
}

export const click = (element: Element) =>
    act(() => {
        fireEvent.click(element)
    })
export const pointerEnter = (element: Element) =>
    act(() => {
        fireEvent.pointerEnter(element)
    })
export const pointerLeave = (element: Element) =>
    act(() => {
        fireEvent.pointerLeave(element)
    })
export const pointerDown = (element: Element) =>
    act(() => {
        fireEvent.pointerDown(element)
    })
export const pointerUp = (element: Element) =>
    act(() => {
        fireEvent.pointerUp(element)
    })
export const focus = (element: HTMLElement, testId: string) =>
    act(() => {
        getByTestId(element, testId).focus()
    })
export const blur = (element: HTMLElement, testId: string) =>
    act(() => {
        getByTestId(element, testId).blur()
    })

export const render = (children: any) => {
    const renderReturn = testRender(
        <React.StrictMode>{children}</React.StrictMode>
    )

    return {
        ...renderReturn,
        rerender: (children: any) =>
            renderReturn.rerender(
                <React.StrictMode>{children}</React.StrictMode>
            ),
    }
}
