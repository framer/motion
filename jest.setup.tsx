import "jest-dom/extend-expect"
// Get fireEvent from the native testing library
// because @testing-library/react one switches out mouseEnter and mouseLeave
import { fireEvent } from "@testing-library/dom"
import { render as testRender, act } from "@testing-library/react"
import * as React from "react"

export const click = (element: Element) =>
    act(() => {
        fireEvent.click(element)
    })
export const mouseEnter = (element: Element) => {
    act(() => {
        fireEvent.pointerEnter(element)
    })
}
export const mouseLeave = (element: Element) => {
    act(() => {
        fireEvent.pointerLeave(element)
    })
}
export const mouseDown = (element: Element) =>
    act(() => {
        fireEvent.pointerDown(element)
    })
export const mouseUp = (element: Element) =>
    act(() => {
        fireEvent.pointerUp(element)
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
