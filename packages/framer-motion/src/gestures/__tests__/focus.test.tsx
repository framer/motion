import { focus, blur, render } from "../../../jest.setup"
import * as React from "react"
import { motion, motionValue } from "../../"
import { transformValues } from "../../motion/__tests__/util-transform-values"
import { sync } from "../../frameloop"

describe("focus", () => {
    test("whileFocus applied", async () => {
        const promise = new Promise((resolve) => {
            const opacity = motionValue(1)
            const ref = React.createRef<HTMLAnchorElement>()
            const Component = () => (
                <motion.a
                    ref={ref}
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus={{ opacity: 0.1 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            ref.current!.matches = () => true

            focus(container, "myAnchorElement")

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(0.1)
    })

    test("whileFocus not applied when :focus-visible is false", async () => {
        const promise = new Promise((resolve) => {
            const opacity = motionValue(1)
            const ref = React.createRef<HTMLAnchorElement>()
            const Component = () => (
                <motion.a
                    ref={ref}
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus={{ opacity: 0.1 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            ref.current!.matches = () => false

            focus(container, "myAnchorElement")

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(1)
    })

    test("whileFocus applied if focus-visible selector throws unsupported", async () => {
        const promise = new Promise((resolve) => {
            const opacity = motionValue(1)
            const ref = React.createRef<HTMLAnchorElement>()
            const Component = () => (
                <motion.a
                    ref={ref}
                    data-testid="myAnchorElement"
                    href="#"
                    whileFocus={{ opacity: 0.1 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                ></motion.a>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            ref.current!.matches = () => {
                /**
                 * Explicitly throw as while Jest throws we want to ensure this
                 * behaviour isn't silently fixed should it fix this in the future.
                 */
                throw new Error("this selector not supported")
            }

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
            const ref = React.createRef<HTMLAnchorElement>()
            const opacity = motionValue(1)
            const Component = () => (
                <motion.a
                    ref={ref}
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

            ref.current!.matches = () => true

            focus(container, "myAnchorElement")

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(target)
    })

    test("whileFocus is unapplied when blur", () => {
        const promise = new Promise((resolve) => {
            const ref = React.createRef<HTMLAnchorElement>()
            const variant = {
                hidden: { opacity: 0.5, transitionEnd: { opacity: 0.75 } },
            }
            const opacity = motionValue(1)

            let blurred = false
            const onComplete = () => blurred && resolve(opacity.get())

            const Component = ({ onAnimationComplete }: any) => (
                <motion.a
                    ref={ref}
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

            ref.current!.matches = () => true

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
            const ref = React.createRef<HTMLAnchorElement>()

            const Component = () => (
                <motion.a
                    ref={ref}
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

            ref.current!.matches = () => true

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
