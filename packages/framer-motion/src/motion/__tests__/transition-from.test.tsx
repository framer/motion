import {
    pointerDown,
    pointerEnter,
    pointerLeave,
    pointerUp,
    render,
} from "../../../jest.setup"
import { motion, motionValue, frame } from "../../"
import { nextFrame } from "../../gestures/__tests__/utils"
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

    test("transitionFrom works with gestures and initial", async () => {
        return new Promise<void>((resolve) => {
            const Component = () => (
                <motion.div
                    whileHover={{
                        opacity: 0,
                        transitionFrom: {
                            initial: { type: false },
                        },
                    }}
                    initial={{
                        transitionFrom: {
                            initial: { type: false },
                            whileHover: { type: false },
                        },
                    }}
                    style={{ opacity: 0.5 }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            expect(container.firstChild).toHaveStyle("opacity: 0.5")

            pointerEnter(container.firstChild as Element)

            frame.postRender(() => {
                expect(container.firstChild).toHaveStyle("opacity: 0")

                setTimeout(() => {
                    pointerLeave(container.firstChild as Element)

                    frame.postRender(() => {
                        expect(container.firstChild).toHaveStyle("opacity: 0.5")
                        resolve()
                    })
                }, 10)
            })
        })
    })

    test.only("transitionFrom works between gestures", async () => {
        const promise = new Promise<number[]>(async (resolve) => {
            const output: number[] = []
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileTap={{
                        opacity: 1,
                        transitionFrom: { whileHover: { type: false } },
                    }}
                    whileHover={{
                        opacity: 0,
                        transitionFrom: {
                            animate: { type: false },
                            whileTap: { type: false },
                        },
                    }}
                    animate={{
                        opacity: 0.5,
                    }}
                    initial={false}
                    transition={{ duration: 5 }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            output.push(opacity.get())

            pointerEnter(container.firstChild as Element)

            await nextFrame()

            output.push(opacity.get())

            setTimeout(async () => {
                pointerDown(container.firstChild as Element)

                await nextFrame()

                output.push(opacity.get())

                setTimeout(async () => {
                    pointerUp(container.firstChild as Element)

                    await nextFrame()

                    output.push(opacity.get())
                    resolve(output)
                }, 10)
            }, 10)
        })

        return expect(promise).resolves.toEqual([0.5, 0, 1, 0])
    })
})
