import { focus, blur, render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { motionValue } from "../../value"
import { transformValues } from "../../motion/__tests__/util-transform-values"
import sync from "framesync"

describe("focus", () => {
    test("whileFocus applied", async () => {
        const promise = new Promise((resolve) => {
            const opacity = motionValue(1)
            const Component = () => (
                <motion.a
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus={{ opacity: 0.1 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            focus(container, "myAnchorElement")

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(0.1)
    })

    test("whileFocus applied as variant", async () => {
        const target = 0.5
        const promise = new Promise((resolve) => {
            const variant = {
                hidden: { opacity: target },
            }
            const opacity = motionValue(1)
            const Component = () => (
                <motion.a
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            focus(container, "myAnchorElement")

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("whileFocus is unapplied when blur", () => {
        const promise = new Promise((resolve) => {
            const variant = {
                hidden: { opacity: 0.5, transitionEnd: { opacity: 0.75 } },
            }
            const opacity = motionValue(1)

            let blurred = false
            const onComplete = () => blurred && resolve(opacity.get())

            const Component = ({ onAnimationComplete }: any) => (
                <motion.a
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ opacity }}
                    onAnimationComplete={onAnimationComplete}
                ></motion.a>
            )

            const { container } = render(
                <Component onAnimationComplete={onComplete} />
            )

            focus(container, "myAnchorElement")
            setTimeout(() => {
                blurred = true
                blur(container, "myAnchorElement")
            }, 10)
        })

        return expect(promise).resolves.toBe(1)
    })

    test("special transform values are unapplied when focus ends", () => {
        const promise = new Promise((resolve) => {
            const variant = {
                hidden: { size: 50 },
            }

            const Component = () => (
                <motion.a
                    transformValues={transformValues}
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus="hidden"
                    variants={variant}
                    transition={{ type: false }}
                    style={{ size: 100 }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            focus(container, "myAnchorElement")

            sync.postRender(() => {
                blur(container, "myAnchorElement")
                sync.postRender(() => resolve(container.firstChild as Element))
            })
        })

        return expect(promise).resolves.toHaveStyle(
            "width: 100px; height: 100px;"
        )
    })
})
