import "../../../jest.setup"
import { render, fireEvent } from "react-testing-library"
import * as React from "react"
import { useCycle } from "../use-cycle"

describe("useCycle", () => {
    test("cycles through given states", () => {
        let results: number[] = []

        const Component = () => {
            const [latest, cycle] = useCycle([1, 2, 3, 4])
            results.push(latest)
            return <div onClick={() => cycle()} />
        }

        const { container } = render(<Component />)
        fireEvent.click(container.firstChild as Element)
        fireEvent.click(container.firstChild as Element)
        fireEvent.click(container.firstChild as Element)
        fireEvent.click(container.firstChild as Element)

        expect(results).toEqual([1, 2, 3, 4, 1])
    })

    test("starts from given initial index", () => {
        let result: number = 0

        const Component = () => {
            const [latest, cycle] = useCycle([1, 2, 3, 4], 1)
            result = latest
            return <div onClick={() => cycle()} />
        }

        render(<Component />)

        expect(result).toBe(2)
    })

    test("jumps to a given index", () => {
        let result: number = 0

        const Component = () => {
            const [latest, cycle] = useCycle([1, 2, 3, 4], 1)
            result = latest
            return <div onClick={() => cycle(2)} />
        }

        const { container } = render(<Component />)
        fireEvent.click(container.firstChild as Element)

        expect(result).toBe(3)
    })
})

// initial index
// cycle(index)
