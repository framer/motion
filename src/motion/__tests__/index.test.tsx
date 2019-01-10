import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import styled from "styled-components"
import { useMotionValue } from "../../value/use-motion-value"
import { PoseAndTransition, Poses } from "../../types"

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
        const Component = React.forwardRef((_props, ref: React.RefObject<HTMLButtonElement>) => (
            <button type="submit" disabled ref={ref} />
        ))
        const MotionComponent = motion.custom(Component)

        const promise = new Promise(resolve => {
            const { rerender } = render(<MotionComponent ref={ref => resolve(ref)} />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toHaveAttribute("disabled")
    })

    test("accepts createref", async () => {
        const promise = new Promise(resolve => {
            const ref = React.createRef<null | Element>()
            const Component = () => {
                React.useEffect(() => {
                    resolve(ref.current)
                })
                return <motion.button type="submit" ref={ref} />
            }
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toHaveAttribute("type", "submit")
    })

    test("generates style attribute from default pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
        }

        const { container } = render(<motion.div animation={poses} />)
        expect(container.firstChild).toHaveStyle("background-color: #fff")
    })

    test("generates style attribute from set pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
            foo: { backgroundColor: "#000" },
        }

        const { container } = render(<motion.div animation={poses} pose="foo" />)
        expect(container.firstChild).toHaveStyle("background-color: #000")
    })

    test("generates correct style attribute from list of poses", () => {
        const poses = {
            default: { x: 100, backgroundColor: "#fff" },
            foo: { backgroundColor: "#000" },
        }

        const { container } = render(<motion.div animation={poses} pose={["default", "foo"]} />)
        expect(container.firstChild).toHaveStyle("background-color: #000; transform: translateX(100px) translateZ(0)")
    })

    test("overwrites provided style attr with pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
        }

        const { container } = render(<motion.div animation={poses} style={{ backgroundColor: "#f00", left: 500 }} />)
        expect(container.firstChild).toHaveStyle("background-color: #fff; left: 500px")
    })

    test("generates correct style attribute for children components", () => {
        const childPoses = {
            foo: { backgroundColor: "#333" },
        }

        const { getByTestId } = render(
            <motion.div pose="foo">
                <motion.div animation={childPoses} inherit data-testid="child" />
            </motion.div>
        )

        expect(getByTestId("child")).toHaveStyle("background-color: #333")
    })

    test("renders styled component and overwrites style", () => {
        const Box = styled.div`
            background-color: #fff;
        `

        const MotionBox = motion.custom(Box)
        const { container } = render(<MotionBox style={{ backgroundColor: "#f00" }} />)
        expect(container.firstChild).toHaveStyle("background-color: #f00")
    })

    test("applies styles defined in applyOnEnd", () => {
        const poses: Poses = {
            default: [{ backgroundColor: "#f00" }, { applyOnEnd: { display: "none" } }],
        }

        const { container } = render(<motion.div animation={poses} />)
        expect(container.firstChild).toHaveStyle("display: none")
    })

    test("accepts motion value and renders as an initial style", () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateZ(0)")
    })
})

describe("motion component pose animations", () => {
    test("fires onPoseComplete", async () => {
        const poses: Poses = {
            foo: { x: 100 },
            bar: [{ x: 0 }, false],
        }

        const promise = new Promise(resolve => {
            const { rerender } = render(<motion.div animation={poses} pose="foo" />)
            const onComplete = () => {
                resolve("fired")
            }

            rerender(<motion.div animation={poses} pose="bar" onPoseComplete={onComplete} />)
            rerender(<motion.div animation={poses} pose="bar" />)
        })

        await expect(promise).resolves.toEqual("fired")
    })
})
