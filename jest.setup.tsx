import "jest-dom/extend-expect"
// Get fireEvent from the native testing library
// because @testing-library/react one switches out mouseEnter and mouseLeave
import { fireEvent } from "@testing-library/dom"
import { render as testRender } from "@testing-library/react"
import * as React from "react"

export const { mouseEnter, mouseLeave } = fireEvent
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
