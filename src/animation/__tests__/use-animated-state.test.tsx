import { render } from "../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { useAnimatedState } from "../use-animated-state"

describe("useAnimatedState", () => {
    test("animates values", async () => {
        const promise = new Promise((resolve) => {
            let latest = { foo: 0 }
            let hasAnimated = false

            const Component = () => {
                const [state, setState] = useAnimatedState({ foo: 0 })
                latest = state
                hasAnimated =
                    hasAnimated || (state.foo !== 0 && state.foo !== 100)

                useEffect(() => {
                    setState({
                        foo: 100,
                        transition: { duration: 0.05 },
                    }).then(() =>
                        requestAnimationFrame(() =>
                            resolve([hasAnimated, latest.foo])
                        )
                    )
                }, [])

                return <div />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toEqual([true, 100])
    })
})
