import "../../../jest.setup"
import { render } from "@testing-library/react"
import * as React from "react"
import { shallowCompare, useInline } from "../use-inline"

describe("shallowCompare", () => {
    test("returns false if args are different", () => {
        expect(shallowCompare([0], null)).toBe(false)
        expect(shallowCompare([0], [1])).toBe(false)
        expect(shallowCompare([0], [0, 1])).toBe(false)
        expect(shallowCompare([[]], [[]])).toBe(false)
        expect(shallowCompare([{}], [{}])).toBe(false)
    })
    test("returns true if args are same", () => {
        expect(shallowCompare([0, 1, "a"], [0, 1, "a"])).toBe(true)
        const arr = [0, 1, 2]
        expect(shallowCompare([arr], [arr])).toBe(true)
        expect(shallowCompare([], [])).toBe(true)
    })
})

describe("useInline", () => {
    test("to not re-run callback if dependencies haven't changed", () => {
        const callback = jest.fn()

        const Component = () => {
            useInline(callback, [0])
            return null
        }

        const { rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        expect(callback).toBeCalledTimes(1)
    })
    test("to re-run callback if dependencies have changed", () => {
        const callback = jest.fn()

        const Component = ({ i }: { i: number }) => {
            useInline(callback, [i])
            return null
        }

        const { rerender } = render(<Component i={0} />)
        rerender(<Component i={1} />)
        rerender(<Component i={2} />)
        rerender(<Component i={3} />)
        rerender(<Component i={4} />)

        expect(callback).toBeCalledTimes(5)
    })
})
