import { render } from "../../../jest.setup"
import * as React from "react"
import { useSpring } from "../use-spring"
import { useMotionValue } from "../use-motion-value"
import { motionValue, MotionValue } from ".."
import { motion } from "../../"

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

    test("unsubscribes when attached to a new value", () => {
        const a = motionValue(0)
        const b = motionValue(0)
        let y: MotionValue<number>
        const Component = ({ target }: { target: MotionValue<number> }) => {
            y = useSpring(target)
            return <motion.div style={{ y }} />
        }

        const { rerender } = render(<Component target={a} />)
        rerender(<Component target={b} />)
        rerender(<Component target={a} />)
        rerender(<Component target={b} />)
        rerender(<Component target={a} />)
        rerender(<Component target={a} />)

        expect((a!.updateSubscribers! as any).subscriptions.size).toBe(1)
    })
})
