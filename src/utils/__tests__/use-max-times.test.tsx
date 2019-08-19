import "../../../jest.setup"
import { render } from "@testing-library/react"
import * as React from "react"
import { useMaxTimes } from "../use-max-times"

describe("useMaxTimes", () => {
    test("to only run callback once if maxTimes is 1", () => {
        const callback = jest.fn()

        const Component = () => {
            useMaxTimes(callback, 1)
            return null
        }

        const { rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        expect(callback).toBeCalledTimes(1)
    })

    test("to run every render if maxTimes is Infinity", () => {
        const callback = jest.fn()

        const Component = () => {
            useMaxTimes(callback, Infinity)
            return null
        }

        const { rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        expect(callback).toBeCalledTimes(5)
    })
})
