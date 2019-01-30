import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import styled from "styled-components"
import { Variants } from "../../types"
import { motionValue } from "../../value"

/**
 * Note:
 *
 * There's currently a "bug" inherent in testing components using React hooks.
 * Components aren't really mounted/rendered with the initial render and it
 * requires a `rerender` to force this behaviour. The React team are working
 * to offer a way to flush effects but until then we have these rerenders in async tests.
 */
describe("motion component rendering and styles", () => {
    test("renders", () => {
        const { container } = render(<motion.div />)
        expect(container.firstChild).toBeTruthy()
    })

    test("renders child", () => {
        const { getByTestId } = render(
            <motion.div>
                <div data-testid="child" />
            </motion.div>
        )
        expect(getByTestId("child")).toBeTruthy()
    })

    test("renders custom component", async () => {
        const Component = React.forwardRef(
            (_props, ref: React.RefObject<HTMLButtonElement>) => (
                <button type="submit" disabled ref={ref} />
            )
        )
        const MotionComponent = motion.custom(Component)

        const promise = new Promise<Element>(resolve => {
            const { rerender } = render(
                <MotionComponent ref={ref => resolve(ref as Element)} />
            )
            rerender(<Component />)
        })

        await expect(promise).resolves.toHaveAttribute("disabled")
    })

    test("accepts createref", async () => {
        const promise = new Promise<Element>(resolve => {
            const ref = React.createRef<null | Element>()
            const Component = () => {
                React.useEffect(() => {
                    resolve(ref.current as Element)
                })
                return <motion.button type="submit" ref={ref} />
            }
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toHaveAttribute("type", "submit")
    })

    test("generates style attribute if passed a special transform style attr", () => {
        const { container } = render(
            <motion.div style={{ x: 10, background: "#fff" }} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: #fff"
        )
    })

    test("generates style attribute if passed initial", () => {
        const { container } = render(
            <motion.div initial={{ x: 10, background: "#fff" }} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: rgb(255, 255, 255)"
        )
    })

    test("generates style attribute if passed initial as variant label", () => {
        const variants = {
            foo: { x: 10, background: "#fff" },
        }
        const { container } = render(
            <motion.div initial="foo" variants={variants} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: rgb(255, 255, 255)"
        )
    })

    test("generates style attribute if passed initial as variant label is function", () => {
        const variants = {
            foo: ({ i }) => ({ x: i * 10 }),
        }
        const childVariants = {
            foo: ({ i }) => ({ x: i * 10 }),
        }

        const { getByTestId } = render(
            <motion.div initial="foo" variants={variants}>
                <motion.div variants={childVariants} data-testid="a" i={0} />
                <motion.div variants={childVariants} data-testid="b" i={1} />
            </motion.div>
        )
        expect(getByTestId("a")).toHaveStyle("transform: none")
        expect(getByTestId("b")).toHaveStyle(
            "transform: translateX(10px) translateZ(0)"
        )
    })

    test("generates style attribute for children if passed initial as variant label", () => {
        const variants = {
            foo: { x: 10, background: "#fff" },
        }
        const childVariants = {
            foo: { opacity: 0, color: "#f00" },
        }

        const { getByTestId } = render(
            <motion.div initial="foo" variants={variants}>
                <motion.div variants={childVariants} data-testid="child" />
            </motion.div>
        )
        expect(getByTestId("child")).toHaveStyle("opacity: 0; color: #f00")
    })

    test("generates style attribute for nested children if passed initial as variant label", () => {
        const variants = {
            foo: { x: 10, background: "#fff" },
        }
        const childVariants = {
            foo: { opacity: 0, color: "#f00" },
        }

        const { getByTestId } = render(
            <motion.div initial="foo" variants={variants}>
                <motion.div variants={childVariants} data-testid="child">
                    <motion.div
                        variants={childVariants}
                        data-testid="nestedchild"
                    />
                </motion.div>
            </motion.div>
        )
        expect(getByTestId("nestedchild")).toHaveStyle(
            "opacity: 0; color: #f00"
        )
    })

    test("doesnt propagate style for children if passed initial as object", () => {
        const { getByTestId } = render(
            <motion.ul
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.li data-testid="child" />
            </motion.ul>
        )

        expect(getByTestId("child")).not.toHaveStyle(
            "opacity: 0; transform: translateY(50px) translateZ(0)"
        )
    })

    test("renders styled component and overwrites style", () => {
        const Box = styled.div`
            background-color: #fff;
        `

        const MotionBox = motion.custom(Box)
        const { container } = render(
            <MotionBox style={{ backgroundColor: "#f00" }} />
        )
        expect(container.firstChild).toHaveStyle("background-color: #f00")
    })
})

describe("SVG", () => {
    // We can't offer SSR support for transforms as the sanitisation (as in mental
    // sanity) of the SVG transform model relies on measuring the dimensions
    // of the SVG element. So we prevent the setting of initial CSS properties
    // that may be in conflict.
    test("sets initial attributes", () => {
        const { getByTestId } = render(
            <svg>
                <motion.g data-testid="g" initial={{ x: 100 }} />
            </svg>
        )

        expect(getByTestId("g")).not.toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })
})

describe("animate prop as object", () => {
    test("animates to set prop", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const { rerender } = render(
                <motion.div
                    animate={{ x: 20 }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            rerender(<motion.div animate={{ x: 20 }} style={{ x }} />)
        })

        await expect(promise).resolves.toBe(20)
    })

    test("accepts custom transition prop", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const { rerender } = render(
                <motion.div
                    animate={{ x: 20 }}
                    transition={{ x: { type: "tween", to: 50 } }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            rerender(<motion.div animate={{ x: 20 }} style={{ x }} />)
        })

        await expect(promise).resolves.toBe(50)
    })
})

describe("animate prop as variant", () => {
    const variants = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 100 },
    }
    const childVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 50 },
    }

    test("animates to set variant", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const { rerender } = render(
                <motion.div
                    animate="visible"
                    variants={variants}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            rerender(
                <motion.div
                    animate="visible"
                    variants={variants}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
        })

        await expect(promise).resolves.toBe(100)
    })

    test("child animates to set variant", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const Component = () => (
                <motion.div
                    animate="visible"
                    variants={variants}
                    onAnimationComplete={onComplete}
                >
                    <motion.div variants={childVariants} style={{ x }} />
                </motion.div>
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(50)
    })

    test("onUpdate", async () => {
        const promise = new Promise(resolve => {
            let latest = {}

            const onUpdate = l => (latest = l)

            const Component = () => (
                <motion.div
                    onUpdate={onUpdate}
                    initial={{ x: 0, y: 0 }}
                    animate={{ x: 100, y: 100 }}
                    onAnimationComplete={() => resolve(latest)}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toEqual({ x: 100, y: 100 })
    })

    test("applies applyOnEnd", () => {
        const variants: Variants = {
            visible: {
                background: "#f00",
                transitionEnd: { display: "none" },
            },
        }

        const { container } = render(
            <motion.div variants={variants} initial="visible" />
        )
        expect(container.firstChild).toHaveStyle("display: none")
    })

    test("applies applyOnEnd and end of animation", async () => {
        const promise = new Promise(resolve => {
            const variants: Variants = {
                hidden: { background: "#00f" },
                visible: {
                    background: "#f00",
                    transitionEnd: { display: "none" },
                },
            }
            const display = motionValue("block")
            const onComplete = () => resolve(display.get())
            const Component = () => (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={variants}
                    onAnimationComplete={onComplete}
                    style={{ display }}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe("none")
    })

    test("accepts custom transition", async () => {
        const promise = new Promise(resolve => {
            const variants: Variants = {
                hidden: { background: "#00f" },
                visible: {
                    background: "#f00",
                    transition: { to: "#555" },
                },
            }
            const background = motionValue("#00f")
            const onComplete = () => resolve(background.get())
            const Component = () => (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={variants}
                    onAnimationComplete={onComplete}
                    style={{ background }}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe("rgba(85, 85, 85, 1)")
    })
})

/**
 * TODO:
 *
 * xActive
 * xActive as variant with children
 */
