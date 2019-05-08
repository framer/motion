import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { useEffect } from "react"
import { useAnimationState } from "../use-animation-state"

describe("useAnimationState", () => {
    test("animates values", async () => {
        const promise = new Promise(resolve => {
            let latest = {}

            const Component = () => {
                const [state, setState] = useAnimationState({ foo: 0 })
                latest = state

                useEffect(() => {
                    setState({ foo: 100, transition: { duration: 0.05 } }).then(
                        () => requestAnimationFrame(() => resolve(latest))
                    )
                }, [])

                return <div />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toEqual({ foo: 100 })
    })
})
