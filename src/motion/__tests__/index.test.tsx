import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import styled from "styled-components"
import { useMotionValue } from "../../value/use-motion-value"
import { Poses } from "../../types"
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
        const Component = React.forwardRef((_props, ref: React.RefObject<HTMLButtonElement>) => (
            <button type="submit" disabled ref={ref} />
        ))
        const MotionComponent = motion.custom(Component)

        const promise = new Promise<Element>(resolve => {
            const { rerender } = render(<MotionComponent ref={ref => resolve(ref as Element)} />)
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

    test("generates style attribute from default pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
        }

        const { container } = render(<motion.div animate={poses} />)
        expect(container.firstChild).toHaveStyle("background-color: #fff")
    })

    test("generates style attribute from set pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
            foo: { backgroundColor: "#000" },
        }

        const { container } = render(<motion.div animate={poses} pose="foo" />)
        expect(container.firstChild).toHaveStyle("background-color: #000")
    })

    test("generates correct style attribute from list of poses", () => {
        const poses = {
            default: { x: 100, backgroundColor: "#fff" },
            foo: { backgroundColor: "#000" },
        }

        const { container } = render(<motion.div animate={poses} pose={["default", "foo"]} />)
        expect(container.firstChild).toHaveStyle("background-color: #000; transform: translateX(100px) translateZ(0)")
    })

    test("overwrites provided style attr with pose", () => {
        const poses = {
            default: { backgroundColor: "#fff" },
        }

        const { container } = render(<motion.div animate={poses} style={{ backgroundColor: "#f00", left: 500 }} />)
        expect(container.firstChild).toHaveStyle("background-color: #fff; left: 500px")
    })

    test("generates correct style attribute for children components", () => {
        const childPoses = {
            foo: { backgroundColor: "#333" },
        }

        const { getByTestId } = render(
            <motion.div pose="foo">
                <motion.div animate={childPoses} inherit data-testid="child" />
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

        const { container } = render(<motion.div animate={poses} />)
        expect(container.firstChild).toHaveStyle("display: none")
    })

    test("uses `initialPose` as initial value if set", () => {
        const poses: Poses = {
            foo: { x: 222 },
            bar: { x: 333 },
        }

        const childPoses: Poses = {
            foo: { backgroundColor: "#000" },
            bar: { backgroundColor: "#444" },
        }

        const { getByTestId, container } = render(
            <motion.div animate={poses} initialPose="foo" pose="bar">
                <motion.button animate={childPoses} inherit data-testid="child" />
            </motion.div>
        )
        expect(container.firstChild).toHaveStyle("transform: translateX(222px) translateZ(0)")
        expect(getByTestId("child")).toHaveStyle("background-color: #000")
    })

    test("accepts motion value and renders as an initial style", () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateZ(0)")
    })

    test("doesnt override motion value if is draggable", () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} dragEnabled />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateZ(0)")
    })

    test("fires onPoseComplete", async () => {
        const poses: Poses = {
            foo: { x: 100 },
            bar: [{ x: 0 }, { type: false }],
        }

        const promise = new Promise(resolve => {
            const { rerender } = render(<motion.div animate={poses} pose="foo" />)
            const onComplete = () => resolve("fired")

            rerender(<motion.div animate={poses} pose="bar" onPoseComplete={onComplete} />)
            rerender(<motion.div animate={poses} pose="bar" />)
        })

        await expect(promise).resolves.toEqual("fired")
    })
})

describe("motion component pose animations", () => {
    test("fires transitions into new pose", async () => {
        const poses: Poses = {
            foo: { x: 100 },
            bar: [{ x: 300 }, { type: false }],
        }

        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const { rerender } = render(<motion.div animate={poses} pose="foo" style={{ x }} />)
            const onComplete = () => resolve(x.get())

            rerender(<motion.div animate={poses} pose="bar" onPoseComplete={onComplete} />)
            rerender(<motion.div animate={poses} pose="bar" />)
        })

        await expect(promise).resolves.toBe(300)
    })

    test("fires child transitions into new pose", async () => {
        const poses: Poses = {
            foo: { x: 100 },
            bar: { x: 300 },
        }

        const childPoses: Poses = {
            foo: { x: 0 },
            bar: { x: 1000 },
        }

        const parentX = motionValue(0)
        const childX = motionValue(0)

        const promise = new Promise(resolve => {
            const Component = props => (
                <motion.div {...props} animate={poses} style={{ x: parentX }}>
                    <motion.button animate={childPoses} inherit style={{ x: childX }} />
                </motion.div>
            )
            const { rerender } = render(<Component pose="foo" />)
            const onComplete = () => resolve(childX.get())

            rerender(<Component pose="bar" onPoseComplete={onComplete} />)
            rerender(<Component pose="bar" />)
        })

        await expect(promise).resolves.toEqual(1000)
    })

    test("animates to pose on mount if initialPose is set", async () => {
        const poses: Poses = {
            foo: { x: 222 },
            bar: { x: 333 },
        }

        const childPoses: Poses = {
            foo: { backgroundColor: "#000" },
            bar: { backgroundColor: "#444" },
        }

        const x = motionValue(0)
        const backgroundColor = motionValue("#fff")

        const promise = new Promise(resolve => {
            const Component = () => (
                <motion.div
                    animate={poses}
                    style={{ x }}
                    initialPose="foo"
                    pose="bar"
                    onPoseComplete={() => resolve([x.get(), backgroundColor.get()])}
                >
                    <motion.button inherit animate={childPoses} style={{ backgroundColor }} />
                </motion.div>
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toEqual([333, "rgba(68, 68, 68, 1)"])
    })
})
