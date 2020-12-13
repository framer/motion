import { focus, blur, render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { motionValue } from "../../value"
// import { transformValues } from "../../motion/__tests__/util-transform-values"
// import sync from "framesync"

describe("focus", () => {
    test("focus event listeners fire", () => {
        const focusHandler = jest.fn()
        const blurHandler = jest.fn()
        const Component = () => (
            <motion.a
                data-testid="myAnchorElement"
                href="#"
                onFocusStart={focusHandler}
                onFocusEnd={blurHandler}
            />
        )
        const { container } = render(<Component />)

        focus(container, "myAnchorElement")
        blur(container, "myAnchorElement")

        expect(focusHandler).toBeCalledTimes(1)
        expect(blurHandler).toBeCalledTimes(1)
    })

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

    // test("whileHover applied as variant", async () => {
    //     const target = 0.5
    //     const promise = new Promise((resolve) => {
    //         const variant = {
    //             hidden: { opacity: target },
    //         }
    //         const opacity = motionValue(1)
    //         const Component = () => (
    //             <motion.div
    //                 whileHover="hidden"
    //                 variants={variant}
    //                 transition={{ type: false }}
    //                 style={{ opacity }}
    //             />
    //         )

    //         const { container, rerender } = render(<Component />)
    //         rerender(<Component />)

    //         mouseEnter(container.firstChild as Element)

    //         resolve(opacity.get())
    //     })

    //     return expect(promise).resolves.toBe(target)
    // })

    // test("whileHover propagates to children", async () => {
    //     const target = 0.2
    //     const promise = new Promise((resolve) => {
    //         const parent = {
    //             hidden: { opacity: 0.8 },
    //         }
    //         const child = {
    //             hidden: { opacity: target },
    //         }
    //         const opacity = motionValue(1)
    //         const Component = () => (
    //             <motion.div
    //                 whileHover="hidden"
    //                 variants={parent}
    //                 transition={{ type: false }}
    //                 data-id="hoverparent"
    //             >
    //                 <motion.div
    //                     variants={child}
    //                     style={{ opacity }}
    //                     transition={{ type: false }}
    //                     data-id="hoverchild"
    //                 />
    //             </motion.div>
    //         )

    //         const { container } = render(<Component />)

    //         mouseEnter(container.firstChild as Element)
    //         resolve(opacity.get())
    //     })

    //     return expect(promise).resolves.toBe(target)
    // })

    // test("whileHover is unapplied when hover ends", () => {
    //     const promise = new Promise((resolve) => {
    //         const variant = {
    //             hidden: { opacity: 0.5, transitionEnd: { opacity: 0.75 } },
    //         }
    //         const opacity = motionValue(1)

    //         let hasMousedOut = false
    //         const onComplete = () => hasMousedOut && resolve(opacity.get())

    //         const Component = ({ onAnimationComplete }: any) => (
    //             <motion.div
    //                 whileHover="hidden"
    //                 variants={variant}
    //                 transition={{ type: false }}
    //                 style={{ opacity }}
    //                 onAnimationComplete={onAnimationComplete}
    //             />
    //         )

    //         const { container } = render(
    //             <Component onAnimationComplete={onComplete} />
    //         )

    //         mouseEnter(container.firstChild as Element)
    //         setTimeout(() => {
    //             hasMousedOut = true
    //             mouseLeave(container.firstChild as Element)
    //         }, 10)
    //     })

    //     return expect(promise).resolves.toBe(1)
    // })

    // test("whileHover only animates values that arent being controlled by a higher-priority gesture ", () => {
    //     const promise = new Promise((resolve) => {
    //         const variant = {
    //             hovering: { opacity: 0.5, scale: 0.5 },
    //             tapping: { scale: 2 },
    //         }
    //         const opacity = motionValue(1)
    //         const scale = motionValue(1)
    //         const Component = () => (
    //             <motion.div
    //                 whileHover="hovering"
    //                 whileTap="tapping"
    //                 variants={variant}
    //                 transition={{ type: false }}
    //                 style={{ opacity, scale }}
    //             />
    //         )

    //         const { container, rerender } = render(<Component />)
    //         rerender(<Component />)

    //         fireEvent.mouseDown(container.firstChild as Element)
    //         mouseEnter(container.firstChild as Element)

    //         resolve([opacity.get(), scale.get()])
    //     })

    //     return expect(promise).resolves.toEqual([0.5, 2])
    // })

    // test("special transform values are unapplied when hover ends", () => {
    //     const promise = new Promise((resolve) => {
    //         const variant = {
    //             hidden: { size: 50 },
    //         }
    //         const Component = () => (
    //             <motion.div
    //                 transformValues={transformValues}
    //                 whileHover="hidden"
    //                 variants={variant}
    //                 transition={{ type: false }}
    //                 style={{ size: 100 }}
    //             />
    //         )

    //         const { container, rerender } = render(<Component />)
    //         rerender(<Component />)

    //         mouseEnter(container.firstChild as Element)

    //         sync.postRender(() => {
    //             mouseLeave(container.firstChild as Element)
    //             sync.postRender(() => resolve(container.firstChild as Element))
    //         })
    //     })

    //     return expect(promise).resolves.toHaveStyle(
    //         "width: 100px; height: 100px;"
    //     )
    // })
})
