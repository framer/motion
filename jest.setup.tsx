import "jest-dom/extend-expect"
// Get fireEvent from the native testing library
// because @testing-library/react one switches out mouseEnter and mouseLeave
import { fireEvent, getByTestId } from "@testing-library/dom"
import { render as testRender, act } from "@testing-library/react"
import * as React from "react"

export const click = (element: Element) =>
    act(() => {
        fireEvent.click(element)
    })
export const mouseEnter = (element: Element) =>
    act(() => {
        fireEvent.mouseEnter(element)
    })
export const mouseLeave = (element: Element) =>
    act(() => {
        fireEvent.mouseLeave(element)
    })
export const mouseDown = (element: Element) =>
    act(() => {
        fireEvent.mouseDown(element)
    })
export const mouseUp = (element: Element) =>
    act(() => {
        fireEvent.mouseUp(element)
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
