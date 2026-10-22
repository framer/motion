import { act, useEffect, useRef } from "react"
import { render } from "../../jest.setup"
import { useInView } from "../use-in-view"
import { getActiveObserver } from "./mock-intersection-observer"

const target = document.createElement("div")

const enter = () => getActiveObserver()?.([{ target, isIntersecting: true }])

const leave = () => getActiveObserver()?.([{ target, isIntersecting: false }])

describe("useInView", () => {
    test("Returns false on mount", () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
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

    test("Can change initial value", () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = useRef(null)
            const isInView = useInView(ref, { initial: true })

            useEffect(() => {
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

        expect(results).toEqual([true])
    })

    test("Returns true when element enters the viewport", async () => {
        const results: boolean[] = []

        const Component = () => {
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
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
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
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
            const ref = useRef(null)
            const isInView = useInView(ref, { once: true })

            useEffect(() => {
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

    test("Observes an element whose ref attaches after mount", () => {
        const results: boolean[] = []

        const Component = ({ show }: { show: boolean }) => {
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return show ? <div ref={ref} /> : null
        }

        const { rerender } = render(<Component show={false} />)
        expect(getActiveObserver()).toBeUndefined()

        rerender(<Component show />)
        act(enter)

        expect(results).toEqual([false, true])
    })

    test("Stops observing a removed element and observes it once re-added", () => {
        const results: boolean[] = []

        const Component = ({ show }: { show: boolean }) => {
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return show ? <div ref={ref} /> : null
        }

        const { rerender } = render(<Component show />)
        act(enter)

        rerender(<Component show={false} />)
        expect(getActiveObserver()).toBeUndefined()

        rerender(<Component show />)
        expect(getActiveObserver()).toBeDefined()
        act(enter)
        act(leave)

        expect(results).toEqual([false, true, false, true, false])
    })

    test("Resets to false when the observed element is swapped", () => {
        const results: boolean[] = []

        const Component = ({ id }: { id: string }) => {
            const ref = useRef(null)
            const isInView = useInView(ref)

            useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return <div key={id} ref={ref} />
        }

        const { rerender } = render(<Component id="a" />)
        act(enter)

        rerender(<Component id="b" />)
        expect(getActiveObserver()).toBeDefined()

        expect(results).toEqual([false, true, false])
    })

    test("once: stays true and stops observing when the element is removed", () => {
        const results: boolean[] = []

        const Component = ({ show }: { show: boolean }) => {
            const ref = useRef(null)
            const isInView = useInView(ref, { once: true })

            useEffect(() => {
                if (results[results.length - 1] !== isInView)
                    results.push(isInView)
            }, [isInView])

            return show ? <div ref={ref} /> : null
        }

        const { rerender } = render(<Component show />)
        act(enter)

        rerender(<Component show={false} />)
        rerender(<Component show />)
        expect(getActiveObserver()).toBeUndefined()

        expect(results).toEqual([false, true])
    })

    test("Doesn't render again on mount or rerender", () => {
        let renders = 0

        const Component = () => {
            const ref = useRef(null)
            useInView(ref)
            renders++

            return <div ref={ref} />
        }

        const { rerender } = render(<Component />, false)
        rerender(<Component />)

        expect(renders).toBe(2)
    })
})
