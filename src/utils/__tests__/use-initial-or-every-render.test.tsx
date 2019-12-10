import { render } from "../../../jest.setup"
import * as React from "react"
import { useInitialOrEveryRender } from "../use-initial-or-every-render"
import { act } from "@testing-library/react"

describe("useInitialOrEveryRender", () => {
    test("to only run callback on initial render if isInitialOnly is true", () => {
        let callbackHistory: boolean[] = []

        const Component = () => {
            const hasMounted = React.useRef(false)
            const callbackRan = React.useRef(false)
            useInitialOrEveryRender(() => (callbackRan.current = true), true)

            React.useEffect(() => {
                console.log("run component effect", hasMounted.current)
                callbackHistory.push(callbackRan.current)
                callbackRan.current = false
                hasMounted.current = true
            })

            React.useEffect(() => {
                console.log("initial render")
            }, [])

            return null
        }

        let rerender: any

        act(() => {
            rerender = render(<Component />).rerender
        })

        act(() => {
            rerender(<Component />)
        })

        act(() => {
            rerender(<Component />)
        })

        expect(callbackHistory).toEqual([true, false, false])
    })

    test("to run callback on every render if isInitialOnly is falsy", () => {
        let callbackHistory: boolean[] = []

        const Component = () => {
            const callbackRan = React.useRef(false)
            useInitialOrEveryRender(() => (callbackRan.current = true))

            React.useEffect(() => {
                callbackHistory.push(callbackRan.current)
                callbackRan.current = false
            })

            return null
        }

        let rerender: any

        act(() => {
            rerender = render(<Component />).rerender
        })

        act(() => {
            rerender(<Component />)
        })

        act(() => {
            rerender(<Component />)
        })

        expect(callbackHistory).toEqual([true, true, true])
    })
})
