import { render } from "../../../jest.setup"
import { fireEvent } from "@testing-library/react"
import { createDomMotionComponent, motion } from "../../"
import * as React from "react"
import styled from "styled-components"

describe("motion component rendering and styles", () => {
    it("renders", () => {
        const { container } = render(<motion.div />)
        expect(container.firstChild).toBeTruthy()
    })

    it("renders motion div component (using createDomMotionComponent) without type errors ", () => {
        // onTap is a motion component specific prop
        const MotionDiv = createDomMotionComponent("div")
        render(
            <MotionDiv
                id={"myCreatedMotionDiv"}
                onTap={() => {
                    console.log("Just tapping on div")
                }}
            />
        )
        expect(true).toBe(true)
    })

    it("renders HTML and SVG attributes without type errors", () => {
        const Component = () => {
            const ref = React.useRef<HTMLButtonElement | null>(null)
            return (
                <>
                    <motion.button title="test" type="button" />
                    <motion.button ref={ref} />
                    <motion.button
                        animate={{ rotate: 90 }}
                        style={{ overflow: "hidden" }}
                    />
                    <motion.img
                        src="https://framer.com"
                        alt="alternative tag"
                    />
                    <motion.a href="https://framer.com" />
                    <motion.div role="progressbar" aria-valuemax={100} />
                </>
            )
        }
        const { container } = render(<Component />)
        expect(container.firstChild).toBeTruthy()
    })

    it("hydrates a provided ref by the time useLayoutEffect has fired", () => {
        let hasVanillaRef = false
        let hasMotionRef = false

        const Component = () => {
            const vanillaRef = React.useRef<HTMLDivElement>(null)
            const motionRef = React.useRef<HTMLDivElement>(null)

            React.useLayoutEffect(() => {
                if (vanillaRef.current !== null) hasVanillaRef = true
                if (motionRef.current !== null) hasMotionRef = true
            })

            return (
                <>
                    <div ref={vanillaRef} />
                    <motion.div ref={motionRef} />
                </>
            )
        }

        render(<Component />)
        expect(hasVanillaRef).toBe(true)
        expect(hasMotionRef).toBe(true)
    })

    it("renders child", () => {
        const { getByTestId } = render(
            <motion.div>
                <div data-testid="child" />
            </motion.div>
        )
        expect(getByTestId("child")).toBeTruthy()
    })

    it("renders normal event listeners", () => {
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

    it("renders custom component", async () => {
        const Component = React.forwardRef(
            (_props, ref: React.RefObject<HTMLButtonElement>) => (
                <button type="submit" disabled ref={ref} />
            )
        )
        const MotionComponent = motion(Component)

        const promise = new Promise<Element>((resolve) => {
            const { rerender } = render(
                <MotionComponent ref={(ref) => resolve(ref as Element)} />
            )
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveAttribute("disabled")
    })

    it("accepts createref", async () => {
        const promise = new Promise<Element>((resolve) => {
            const ref = React.createRef<HTMLButtonElement>()
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

    // Note: Some part of the testing chain doesn't support setting transform-origin
    it("generates style attribute if passed a special transform style attr", () => {
        const { container } = render(
            <motion.div style={{ x: 10, background: "#fff" }} />
        )

        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: #fff"
        )
        expect(container.firstChild).toHaveStyle("background: #fff")
    })

    it("generates style attribute if passed initial", () => {
        const { container } = render(
            <motion.div initial={{ x: 10, background: "#fff" }} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: rgb(255, 255, 255)"
        )
    })

    it("generates style attribute if passed initial as variant label", () => {
        const variants = { foo: { x: 10, background: "#fff" } }
        const { container } = render(
            <motion.div initial="foo" variants={variants} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0); background: rgb(255, 255, 255)"
        )
    })

    it("generates style attribute if passed initial as false", () => {
        const { container } = render(
            <motion.div initial={false} animate={{ x: 100 }} />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateZ(0);"
        )
    })

    // TODO: Replace dynamic variable test when we implement `custom` attribute: https://github.com/framer/company/issues/12508
    it("generates style attribute if passed initial as variant label is function", () => {
        const variants = { foo: (i: number) => ({ x: i * 10 }) }
        const childVariants = { foo: (i: number) => ({ x: i * 10 }) }

        const { getByTestId } = render(
            <motion.div initial="foo" custom={0} variants={variants}>
                <motion.div
                    variants={childVariants}
                    data-testid="a"
                    custom={0}
                />
                <motion.div
                    variants={childVariants}
                    data-testid="b"
                    custom={1}
                />
            </motion.div>
        )
        expect(getByTestId("a")).toHaveStyle("transform: none")
        expect(getByTestId("b")).toHaveStyle(
            "transform: translateX(10px) translateZ(0)"
        )
    })

    it("generates style attribute for children if passed initial as variant label", () => {
        const variants = { foo: { x: 10, background: "#fff" } }
        const childVariants = { foo: { opacity: 0, color: "#f00" } }

        const { getByTestId } = render(
            <motion.div initial="foo" variants={variants}>
                <motion.div variants={childVariants} data-testid="child" />
            </motion.div>
        )
        expect(getByTestId("child")).toHaveStyle("opacity: 0; color: #f00")
    })

    it("generates style attribute for nested children if passed initial as variant label", () => {
        const variants = { foo: { x: 10, background: "#fff" } }
        const childVariants = { foo: { opacity: 0, color: "#f00" } }

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

    it("doesnt propagate style for children if passed initial as object", () => {
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

    it("renders styled component and overwrites style", () => {
        const Box = styled.div`
            background-color: #fff;
        `

        const MotionBox = motion(Box)
        const { container } = render(
            <MotionBox style={{ backgroundColor: "#f00" }} />
        )
        expect(container.firstChild).toHaveStyle("background-color: #f00")
    })

    it("applies transformTemplate on initial render", () => {
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

    it("renders transform", () => {
        const { container } = render(
            <motion.div style={{ transform: "translateX(10px)" }} />
        )
        expect(container.firstChild).toHaveStyle("transform: translateX(10px)")
    })

    it("applies updated transformTemplate", () => {
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
                    return `translateY(${(newX as number) * 2}px) ${generated}`
                }}
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(20px) translateX(10px) translateZ(0)"
        )
    })

    it("renders transform with transformTemplate", () => {
        const { container } = render(
            <motion.div
                transformTemplate={(_, generated) =>
                    `translateY(20px) ${generated}`
                }
                style={{ x: 10 }}
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(20px) translateX(10px) translateZ(0)"
        )
    })

    it("filters MotionProps from the DOM", () => {
        const { container } = render(<motion.div initial={{ opacity: 0 }} />)
        expect(container.firstChild).not.toHaveAttribute("initial")
    })

    it("it can render inside <StrictMode />", () => {
        function Test() {
            return <motion.div animate={{ x: 100 }} initial={{ x: 0 }} />
        }

        const { container, rerender } = render(<Test />)

        rerender(<Test />)

        expect(container.firstChild).toBeTruthy()
    })

    it("it can render nested components inside <StrictMode />", () => {
        function Test() {
            return (
                <motion.div
                    animate="visible"
                    initial="parent"
                    variants={{
                        visible: { y: 0 },
                        hidden: { y: 5 },
                    }}
                >
                    <motion.span
                        initial="child"
                        variants={{
                            visible: { y: 0 },
                            hidden: { y: 5 },
                        }}
                    />
                </motion.div>
            )
        }

        const { container } = render(<Test />)
        expect(container.firstChild).toBeTruthy()
    })
})
