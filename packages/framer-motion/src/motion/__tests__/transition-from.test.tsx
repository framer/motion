import { pointerEnter, pointerLeave, render } from "../../../jest.setup"
import { motion, motionValue, frame } from "../../"
import * as React from "react"

describe("transitionFrom", () => {
    test("transitionFrom doesn't end up as motion value", async () => {
        const promise = new Promise((resolve) => {
            const Component = () => (
                <motion.div
                    animate={{
                        x: 20,
                        transitionFrom: {
                            initial: {
                                x: { type: "tween", from: 10, ease: () => 0.5 },
                            },
                        },
                    }}
                    onUpdate={(latest) => resolve(latest.transitionFrom)}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toBe(undefined)
    })

    test("transitionFrom works on initial animation", async () => {
        const promise = new Promise((resolve) => {
            const x = motionValue(0)
            const Component = () => (
                <motion.div
                    animate={{
                        x: 20,
                        transitionFrom: {
                            initial: {
                                x: { type: "tween", from: 10, ease: () => 0.5 },
                            },
                        },
                    }}
                    onUpdate={() => resolve(x.get())}
                    style={{ x }}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toBe(15)
    })

    test("uses default and value-specifc settings", async () => {
        const promise = new Promise((resolve) => {
            const x = motionValue(0)
            const opacity = motionValue(0)

            const Component = () => (
                <motion.div
                    animate={{
                        opacity: 1,
                        x: 20,
                        transitionFrom: {
                            initial: {
                                type: false,
                                x: { type: "tween", from: 10, ease: () => 0.5 },
                            },
                        },
                    }}
                    onUpdate={() => {
                        frame.read(() => {
                            resolve([x.get(), opacity.get()])
                        })
                    }}
                    style={{ x, opacity }}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toEqual([15, 1])
    })

    test("transitionFrom works with gestures", async () => {
        const promise = new Promise<number[]>((resolve) => {
            const output: number[] = []
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileHover={{
                        opacity: 0,
                        transitionFrom: {
                            animate: { type: false },
                        },
                    }}
                    animate={{
                        opacity: 0.5,
                        transitionFrom: {
                            initial: { type: false },
                            whileHover: { type: false },
                        },
                    }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            output.push(opacity.get())

            pointerEnter(container.firstChild as Element)

            output.push(opacity.get())

            setTimeout(() => {
                pointerLeave(container.firstChild as Element)

                output.push(opacity.get())
                resolve(output)
            }, 10)
        })

        return expect(promise).resolves.toEqual([0.5, 0, 0.5])
    })
})
