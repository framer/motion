import { render } from "../../../jest.setup"
import * as React from "react"
import { useSpring } from "../use-spring"
import { useMotionValue } from "../use-motion-value"
import { motionValue, MotionValue } from ".."
import { motion } from "../../"
import { syncDriver } from "../../animation/animators/js/__tests__/utils"

describe("useSpring", () => {
    test("can create a motion value from a number", async () => {
        const promise = new Promise((resolve) => {
            const Component = () => {
                const x = useSpring(0)

                React.useEffect(() => {
                    x.on("change", (v) => resolve(v))
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
                    y.on("change", (v) => resolve(v))
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
                    return y.on("change", (v) => {
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

    test("will not animate if immediate=true", async () => {
        const promise = new Promise((resolve) => {
            const output: number[] = []
            const Component = () => {
                const y = useSpring(0, {
                    driver: syncDriver(10),
                } as any)

                React.useEffect(() => {
                    return y.on("change", (v) => {
                        if (output.length >= 10) {
                        } else {
                            output.push(Math.round(v))
                        }
                    })
                })

                React.useEffect(() => {
                    y.jump(100)

                    setTimeout(() => {
                        resolve(output)
                    }, 100)
                }, [])

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const resolved = await promise

        expect(resolved).toEqual([100])
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

        // Cast to any here as `.events` is private API
        expect((a as any).events.change.getSize()).toBe(1)
    })
})
