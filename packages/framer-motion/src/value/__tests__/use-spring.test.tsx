import { render } from "../../../jest.setup"
import * as React from "react"
import { useSpring } from "../use-spring"
import { useMotionValue } from "../use-motion-value"
import { motionValue, MotionValue } from ".."
import { syncDriver } from "../../animation/legacy-popmotion/__tests__/utils"
import { motion } from "../../"

describe("useSpring", () => {
    test("can create a motion value from a number", async () => {
        const promise = new Promise((resolve) => {
            const Component = () => {
                const x = useSpring(0)

                React.useEffect(() => {
                    x.onChange((v) => resolve(v))
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
        const promise = new Promise((resolve) => {
            const Component = () => {
                const x = useMotionValue(0)
                const y = useSpring(x)

                React.useEffect(() => {
                    y.onChange((v) => resolve(v))
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

    test("creates a spring that animates to the subscribed motion value", async () => {
        const promise = new Promise((resolve) => {
            const output: number[] = []
            const Component = () => {
                const x = useMotionValue(0)
                const y = useSpring(x, {
                    driver: syncDriver(10),
                } as any)

                React.useEffect(() => {
                    return y.onChange((v) => {
                        if (output.length >= 10) {
                            resolve(output)
                        } else {
                            output.push(Math.round(v))
                        }
                    })
                })

                React.useEffect(() => {
                    x.set(100)
                }, [])

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const resolved = await promise

        expect(resolved).toEqual([0, 2, 4, 7, 10, 14, 19, 24, 29, 34])
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

        expect(((a! as any).updateSubscribers! as any).getSize()).toBe(1)
    })
})
