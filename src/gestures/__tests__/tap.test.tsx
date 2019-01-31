import * as React from "react"
import { motion } from "../../"
import { render } from "react-testing-library"
import { fireEvent } from "dom-testing-library"

describe("tap", () => {
    test("tap event listeners fire", () => {
        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        expect(tap).toBeCalledTimes(1)
    })

    test("tap event listeners unset", () => {
        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        rerender(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        expect(tap).toBeCalledTimes(3)
    })
})
