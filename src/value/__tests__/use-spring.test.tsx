import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { useSpring } from "../use-spring"
import { useMotionValue } from "../use-motion-value"

describe("useSpring", () => {
    test("can create a motion value from a number", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const x = useSpring(0)

                React.useEffect(() => {
                    x.onChange(v => resolve(v))
                    x.set(100)
                })

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const resolved = await promise

        expect(resolved).not.toBe(0)
        expect(resolved).not.toBe(100)
    })
    test("can create a MotionValue that responds to changes from another MotionValue", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const x = useMotionValue(0)
                const y = useSpring(x)

                React.useEffect(() => {
                    y.onChange(v => resolve(v))
                    x.set(100)
                })

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const resolved = await promise

        expect(resolved).not.toBe(0)
        expect(resolved).not.toBe(100)
    })
})
