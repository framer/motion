import "../../../jest.setup"
import { render, fireEvent } from "react-testing-library"
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

    test("renders normal event listeners", () => {
        const onMouseEnter = jest.fn()
        const onMouseLeave = jest.fn()
        const { container } = render(
            <motion.div
                onMouseEnter={() => onMouseEnter()}
                onMouseLeave={() => onMouseLeave()}
            />
        )

        fireEvent.mouseEnter(container.firstChild as Element)
        fireEvent.mouseLeave(container.firstChild as Element)

        expect(onMouseEnter).toBeCalled()
        expect(onMouseLeave).toBeCalled()
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

        return expect(promise).resolves.toHaveAttribute("disabled")
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

        return expect(promise).resolves.toHaveAttribute("type", "submit")
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
        type Props = { i: number }

        const variants = {
            foo: ({ i }: Props) => ({ x: i * 10 }),
        }
        const childVariants = {
            foo: ({ i }: Props) => ({ x: i * 10 }),
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

    test("style supports originX and originY", () => {
        const { container } = render(<motion.div style={{ originX: "25%" }} />)
        expect(container.firstChild).toHaveStyle("transform-origin: 25% 50%")
    })

    test("updates style for transform values", () => {
        let rotate = 0

        const Component = () => {
            rotate += 45
            return <motion.div style={{ rotate }} />
        }
        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: rotate(90deg) translateZ(0)"
        )
    })

    test("applies transformTemplate on initial render", () => {
        const { container } = render(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) =>
                    `translateY(${x}) ${generated}`
                }
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(10px) translateX(10px) translateZ(0)"
        )
    })

    test("applies updated transformTemplate", () => {
        const { container, rerender } = render(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) =>
                    `translateY(${x}) ${generated}`
                }
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(10px) translateX(10px) translateZ(0)"
        )

        rerender(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) => {
                    const newX = typeof x === "string" ? parseFloat(x) : x
                    return `translateY(${newX * 2}px) ${generated}`
                }}
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(20px) translateX(10px) translateZ(0)"
        )
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

        return expect(promise).resolves.toBe(20)
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

        return expect(promise).resolves.toBe(50)
    })

    test("animates to set prop and preserves existing initial transform props", async () => {
        const promise = new Promise(resolve => {
            const onComplete = () => {
                // Animation complete currently fires when animation is complete, before the actual render
                setTimeout(() => resolve(container.firstChild as any), 20)
            }
            const { container, rerender } = render(
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ x: 20 }}
                    onAnimationComplete={onComplete}
                />
            )
            rerender(<motion.div initial={{ scale: 0 }} animate={{ x: 20 }} />)
        })

        return expect(promise).resolves.toHaveStyle(
            "transform: translateX(20px) scale(0) translateZ(0)"
        )
    })

    test("style doesnt overwrite in subsequent renders", async () => {
        const promise = new Promise(resolve => {
            const history: number[] = []
            const onAnimationComplete = () => {
                setTimeout(() => {
                    let styleHasOverridden = false
                    let prev = 0

                    for (let i = 0; i < history.length; i++) {
                        if (history[i] < prev) {
                            styleHasOverridden = true
                            break
                        }

                        prev = history[i]
                    }

                    resolve(styleHasOverridden)
                }, 20)
            }
            const Component = ({ rotate, onComplete }) => (
                <motion.div
                    animate={{ rotate }}
                    transition={{ duration: 0.05 }}
                    style={{ rotate: "0deg" }}
                    onUpdate={({ rotate }) => history.push(parseFloat(rotate))}
                    onAnimationComplete={onComplete}
                />
            )

            const { rerender } = render(<Component rotate={1000} />)

            rerender(<Component rotate={1000} />)
            setTimeout(() => {
                rerender(
                    <Component rotate={1001} onComplete={onAnimationComplete} />
                )
            }, 120)
        })

        return expect(promise).resolves.toBe(false)
    })

    test("applies custom transform", async () => {
        const promise = new Promise(resolve => {
            const resolveContainer = () => {
                requestAnimationFrame(() => {
                    resolve(container)
                })
            }

            const Component = () => (
                <motion.div
                    initial={{ x: 10 }}
                    animate={{ x: 30 }}
                    transition={{ duration: 10 }}
                    transformTemplate={({ x }, generated) =>
                        `translateY(${x}) ${generated}`
                    }
                    onAnimationComplete={resolveContainer}
                />
            )

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        expect(promise).resolves.toHaveStyle(
            "transform: translateX(30px) translateX(30px) translateZ(0)"
        )
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

        return expect(promise).resolves.toBe(100)
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

        return expect(promise).resolves.toBe(50)
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

        return expect(promise).resolves.toEqual({ x: 100, y: 100 })
    })

    test("applies applyOnEnd if set on initial", () => {
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

        return expect(promise).resolves.toBe("none")
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

        return expect(promise).resolves.toBe("rgba(85, 85, 85, 1)")
    })

    test("respects default `transition` if no transition is defined", async () => {
        const promise = new Promise(resolve => {
            const opacity = motionValue(0)
            const variants: Variants = {
                visible: {
                    opacity: 1,
                },
                hidden: {
                    opacity: 0,
                },
            }

            const { container } = render(
                <motion.div
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            requestAnimationFrame(() => resolve(opacity.get()))
        })

        return expect(promise).resolves.toBe(1)
    })
})

describe("static prop", () => {
    test("it prevents rendering of animated values", async () => {
        const promise = new Promise(resolve => {
            const scale = motionValue(0)
            const Component = () => (
                <motion.div
                    animate={{ scale: 2 }}
                    transition={{ type: false }}
                    style={{ scale }}
                    static
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => resolve(scale.get()), 50)
        })

        return expect(promise).resolves.toBe(0)
    })

    test("it permits updating transform values via style", () => {
        const { container, rerender } = render(
            <motion.div static style={{ x: 100 }} />
        )
        rerender(<motion.div static style={{ x: 200 }} />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(200px)"
        )
    })

    test("it prevents rendering of children via context", async () => {
        const promise = new Promise(resolve => {
            const scale = motionValue(0)
            const Component = () => (
                <motion.div
                    animate={{ opacity: 0 }}
                    transition={{ type: false }}
                    static
                >
                    <motion.button
                        animate={{ scale: 2 }}
                        transition={{ type: false }}
                        style={{ scale }}
                    />
                </motion.div>
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => resolve(scale.get()), 50)
        })

        return expect(promise).resolves.toBe(0)
    })
})
