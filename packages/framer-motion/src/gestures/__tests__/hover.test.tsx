import {
    pointerDown,
    pointerEnter,
    pointerLeave,
    render,
} from "../../../jest.setup"
import { motion } from "../../"
import { motionValue } from "../../value"
import { frame } from "../../frameloop"
import { nextFrame } from "./utils"

describe("hover", () => {
    test("hover event listeners fire", async () => {
        const hoverIn = jest.fn()
        const hoverOut = jest.fn()
        const Component = () => (
            <motion.div onHoverStart={hoverIn} onHoverEnd={hoverOut} />
        )

        const { container } = render(<Component />)
        pointerEnter(container.firstChild as Element)
        pointerLeave(container.firstChild as Element)

        return new Promise<void>((resolve) => {
            frame.render(() => {
                expect(hoverIn).toBeCalledTimes(1)
                expect(hoverOut).toBeCalledTimes(1)
                resolve()
            })
        })
    })

    test("filters touch events", async () => {
        const hoverIn = jest.fn()
        const hoverOut = jest.fn()
        const Component = () => (
            <motion.div onHoverStart={hoverIn} onHoverEnd={hoverOut} />
        )

        const { container } = render(<Component />)
        pointerEnter(container.firstChild as Element, { pointerType: "touch" })
        pointerLeave(container.firstChild as Element, { pointerType: "touch" })

        return new Promise<void>((resolve) => {
            frame.render(() => {
                expect(hoverIn).toBeCalledTimes(0)
                expect(hoverOut).toBeCalledTimes(0)
                resolve()
            })
        })
    })

    test("whileHover applied", async () => {
        const promise = new Promise(async (resolve) => {
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileHover={{ opacity: 0 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            pointerEnter(container.firstChild as Element)

            await nextFrame()

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(0)
    })

    test("whileHover applied as variant", async () => {
        const target = 0.5
        const promise = new Promise(async (resolve) => {
            const variant = {
                hidden: { opacity: target },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileHover="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            pointerEnter(container.firstChild as Element)

            await nextFrame()

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("whileHover propagates to children", async () => {
        const target = 0.2
        const promise = new Promise(async (resolve) => {
            const parent = {
                hidden: { opacity: 0.8 },
            }
            const child = {
                hidden: { opacity: target },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileHover="hidden"
                    variants={parent}
                    transition={{ type: false }}
                    data-id="hoverparent"
                >
                    <motion.div
                        variants={child}
                        style={{ opacity }}
                        transition={{ type: false }}
                        data-id="hoverchild"
                    />
                </motion.div>
            )

            const { container } = render(<Component />)

            pointerEnter(container.firstChild as Element)

            await nextFrame()
            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("whileHover is unapplied when hover ends", () => {
        const promise = new Promise(async (resolve) => {
            const variant = {
                hidden: { opacity: 0.5, transitionEnd: { opacity: 0.75 } },
            }
            const opacity = motionValue(1)

            let hasMousedOut = false
            const onComplete = () => hasMousedOut && resolve(opacity.get())

            const Component = ({ onAnimationComplete }: any) => (
                <motion.div
                    whileHover="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                    onAnimationComplete={onAnimationComplete}
                />
            )

            const { container } = render(
                <Component onAnimationComplete={onComplete} />
            )

            pointerEnter(container.firstChild as Element)

            await nextFrame()
            setTimeout(() => {
                hasMousedOut = true
                pointerLeave(container.firstChild as Element)
            }, 10)
        })

        return expect(promise).resolves.toBe(1)
    })

    test("whileHover only animates values that arent being controlled by a higher-priority gesture ", () => {
        const promise = new Promise(async (resolve) => {
            const variant = {
                hovering: { opacity: 0.5, scale: 0.5 },
                tapping: { scale: 2 },
            }
            const opacity = motionValue(1)
            const scale = motionValue(1)
            const Component = () => (
                <motion.div
                    whileHover="hovering"
                    whileTap="tapping"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity, scale }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            await nextFrame()
            pointerDown(container.firstChild as Element)

            await nextFrame()
            pointerEnter(container.firstChild as Element)

            await nextFrame()

            resolve([opacity.get(), scale.get()])
        })

        return expect(promise).resolves.toEqual([0.5, 2])
    })
})
