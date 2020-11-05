import { render } from "../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { motion } from "../.."
import { animate } from "../animate"
import { useMotionValue } from "../../value/use-motion-value"
import { MotionValue } from "../../value"

describe("animate", () => {
    test("correctly animates MotionValues", async () => {
        const promise = new Promise<[MotionValue, Element]>((resolve) => {
            const Component = () => {
                const x = useMotionValue(0)
                useEffect(() => {
                    animate(x, 200, {
                        duration: 0.1,
                        onComplete: () => {
                            resolve([x, element])
                        },
                    })
                }, [])
                return <motion.div style={{ x }} />
            }

            const { container, rerender } = render(<Component />)
            const element = container.firstChild as Element
            rerender(<Component />)
        })

        const [value, element] = await promise
        expect(value.get()).toBe(200)
        expect(element).toHaveStyle(
            "transform: translateX(200px) translateZ(0)"
        )
    })

    test("correctly animates normal values", async () => {
        const promise = new Promise<number>((resolve) => {
            const Component = () => {
                let latest = 0
                useEffect(() => {
                    animate(0, 200, {
                        duration: 0.1,
                        onUpdate: (v) => (latest = v),
                        onComplete: () => {
                            resolve(latest)
                        },
                    })
                }, [])
                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(promise).resolves.toBe(200)
    })
    test("correctly hydrates keyframes null with current MotionValue", async () => {
        const promise = new Promise<number[]>((resolve) => {
            const output: number[] = []
            const Component = () => {
                const x = useMotionValue(100)
                useEffect(() => {
                    animate(x, [null, 50], {
                        duration: 0.1,
                        onComplete: () => {
                            resolve(output)
                        },
                    })
                }, [])
                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const output = await promise
        const incorrect = output.filter((v) => v < 50)
        // The default would be to animate from 0 here so if theres no values
        // less than 50 the keyframes were correctly hydrated
        expect(incorrect.length).toBe(0)
    })
})
