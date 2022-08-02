import { render } from "../../../jest.setup"
import * as React from "react"
import { useInView } from "../use-in-view"
import { getActiveObserver } from "./mock-intersection-observer"
import { act } from "react-dom/test-utils"

const target = document.createElement("div")

const enter = () => getActiveObserver()?.([{ target, isIntersecting: true }])

const leave = () => getActiveObserver()?.([{ target, isIntersecting: false }])

describe("useInView", () => {
    test("Returns false on mount", () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = React.useRef(null)
            const isInView = useInView(ref)

            React.useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return <div ref={ref} />
        }

        const { rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        expect(results).toEqual([false])
    })

    test("Returns true when element enters the viewport", async () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = React.useRef(null)
            const isInView = useInView(ref)

            React.useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return <div ref={ref} />
        }

        render(<Component />)
        act(enter)
        act(enter)
        act(enter)
        act(enter)
        act(enter)

        expect(results).toEqual([false, true])
    })

    test("Returns false when element leaves the viewport", async () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = React.useRef(null)
            const isInView = useInView(ref)

            React.useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return <div ref={ref} />
        }

        render(<Component />)
        act(leave)
        act(enter)
        act(leave)
        act(leave)
        act(enter)
        act(leave)

        expect(results).toEqual([false, true, false, true, false])
    })

    test("Only triggers true once, if once is set", async () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = React.useRef(null)
            const isInView = useInView(ref, { once: true })

            React.useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return <div ref={ref} />
        }

        render(<Component />)
        act(leave)
        act(enter)
        act(leave)
        act(leave)
        act(enter)
        act(leave)

        expect(results).toEqual([false, true])
    })
})
