import { mouseEnter, mouseLeave, mouseDown } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { render } from "react-testing-library"
import { motionValue } from "../../value"

describe("hover", () => {
    test("hover event listeners fire", () => {
        const hoverIn = jest.fn()
        const hoverOut = jest.fn()
        const Component = () => (
            <motion.div onHoverStart={hoverIn} onHoverEnd={hoverOut} />
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        mouseEnter(container.firstChild as Element)
        mouseLeave(container.firstChild as Element)

        expect(hoverIn).toBeCalledTimes(1)
        expect(hoverOut).toBeCalledTimes(1)
    })

    test("hoverActive applied", async () => {
        const promise = new Promise(resolve => {
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    hoverActive={{ opacity: 0 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            mouseEnter(container.firstChild as Element)

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(0)
    })

    test("hoverActive applied as variant", async () => {
        const target = 0.5
        const promise = new Promise(resolve => {
            const variant = {
                hidden: { opacity: target },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    hoverActive="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            mouseEnter(container.firstChild as Element)

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("hoverActive propagates to children", async () => {
        const target = 0.2
        const promise = new Promise(resolve => {
            const parent = {
                hidden: { opacity: 0.8 },
            }
            const child = {
                hidden: { opacity: target },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    hoverActive="hidden"
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

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            mouseEnter(container.firstChild as Element)
            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("hoverActive is unapplied when hover ends", () => {
        const promise = new Promise(resolve => {
            const variant = {
                hidden: { opacity: 0.5 },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    hoverActive="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            mouseEnter(container.firstChild as Element)

            setTimeout(() => {
                mouseLeave(container.firstChild as Element)
                resolve(opacity.get())
            }, 10)
        })

        return expect(promise).resolves.toBe(1)
    })

    test("hoverActive only animates values that arent being controlled by a higher-priority gesture ", () => {
        const promise = new Promise(resolve => {
            const variant = {
                hovering: { opacity: 0.5, scale: 0.5 },
                tapping: { scale: 2 },
            }
            const opacity = motionValue(1)
            const scale = motionValue(1)
            const Component = () => (
                <motion.div
                    hoverActive="hovering"
                    tapActive="tapping"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity, scale }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            mouseDown(container.firstChild as Element)
            mouseEnter(container.firstChild as Element)

            resolve([opacity.get(), scale.get()])
        })

        return expect(promise).resolves.toEqual([0.5, 2])
    })
})
