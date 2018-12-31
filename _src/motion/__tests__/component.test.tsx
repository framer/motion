import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import { useMotionValue } from "../../motion-value/use-motion-value"
import styled from "styled-components"
import { CurrentValues } from "../types"

/**
 * Note:
 *
 * There's currently a "bug" inherent in testing components using React hooks.
 * Components aren't really mounted/rendered with the initial render and it
 * requires a `rerender` to force this behaviour. The React team are working
 * to offer a way to flush effects but until then we have these rerenders in async tests.
 */

describe("motion component", () => {
    test("renders", () => {
        const Box = motion.div()
        const { container } = render(<Box />)
        expect(container.firstChild).toBeTruthy()
    })

    test("renders custom component", () => {
        const Box = motion.div()
        const { getByTestId } = render(
            <Box>
                <div data-testid="child" />
            </Box>
        )
        expect(getByTestId("child")).toBeTruthy()
    })

    test("accepts function ref", async () => {
        const Box = motion.div()

        const promise = new Promise(resolve => {
            const Component = () => <Box ref={resolve} />
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBeTruthy()
    })

    test("accepts createRef", async () => {
        const Box = motion.div()

        const promise = new Promise<null | HTMLElement>(resolve => {
            const ref = React.createRef<null | HTMLElement>()
            const Component = () => {
                React.useEffect(() => {
                    resolve(ref.current)
                })
                return <Box ref={ref} />
            }
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBeTruthy()
    })

    test("generates style attr from pose", () => {
        const Box = motion.div({
            default: { backgroundColor: "#fff" },
        })
        const { container } = render(<Box />)
        expect(container.firstChild).toHaveStyle("background-color: #fff")
    })

    test("overwrites provided style attr with pose", () => {
        const Box = motion.div({
            default: { backgroundColor: "#fff" },
        })
        const { container } = render(<Box style={{ backgroundColor: "#000", left: 500 }} />)
        expect(container.firstChild).toHaveStyle("background-color: #fff; left: 500px")
    })

    test("renders styled component and overwrites style", () => {
        const Box = styled.div`
            background: #fff;
        `
        const MotionBox = motion(Box)({
            default: { background: "#000" },
        })

        const { container } = render(<MotionBox style={{ background: "red" }} />)

        expect(container.firstChild).toHaveStyle("background: #000")
    })

    test("takes styles of defined initial pose", () => {
        const Box = motion.div({
            default: { x: 0 },
            foo: { x: 100, transitionEnd: { display: "none" } },
        })
        const { container } = render(<Box pose="foo" />)
        expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateZ(0); display: none;")
    })

    test("takes a list of defined poses", () => {
        const Box = motion.div({
            foo: { x: 100 },
            bar: { y: 100 },
        })
        const { container } = render(<Box pose={["foo", "bar"]} />)
        expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateY(100px) translateZ(0)")
    })

    test("poses are applied in order", () => {
        const Box = motion.div({
            foo: { x: 100, rotate: 123 },
            bar: { y: 100, rotate: 456 },
        })
        const { container } = render(<Box pose={["foo", "bar"]} />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateY(100px) rotate(456deg) translateZ(0)"
        )
    })

    test("doesn't forward pose prop", () => {
        const Box = motion.div({ default: {} })
        const { container } = render(<Box pose="default" />)
        expect(container.firstChild).not.toHaveAttribute("pose")
    })

    test("accepts motion value", () => {
        const Box = motion.div()

        const Component = () => {
            const x = useMotionValue(800)
            return <Box motionValues={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("transform: translateX(800px) translateZ(0)")
    })

    test("fires onPoseComplete", async () => {
        const Box = motion.div({
            foo: { x: 100 },
            bar: { x: 0, transition: false },
        })

        const promise = new Promise(resolve => {
            const { rerender } = render(<Box pose="foo" />)
            const onComplete = (current: CurrentValues) => {
                // We would ideally like to inspect the DOM itself at this point
                // but the node seems to be unmounted after sync ops have flushed
                expect(current.x).toBe(0)
                resolve("fired")
            }
            rerender(<Box pose="bar" onPoseComplete={onComplete} />)

            // To fire effects
            rerender(<Box pose="bar" />)
        })

        await expect(promise).resolves.toEqual("fired")
    })
})
