import { fireEvent, render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import { useMotionValue } from "../../hooks/use-motion-value"
import { useTransform } from "../../hooks/use-transform"
import { usePose } from "../../hooks/use-pose"
import styled from "styled-components"

/**
 * Note:
 *
 * There's currently a "bug" inherent in testing components using React hooks.
 * Components aren't really mounted/rendered with the initial render and it
 * requires a `rerender` to force this behaviour. The React team are working
 * to offer a way to flush effects but until then we have these rerenders in async tests.
 */

test("motion component renders", () => {
    const Box = motion.div()
    const { container } = render(<Box />)
    expect(container.firstChild).toBeTruthy()
})

test("motion component renders custom component", () => {
    const Box = motion.div()
    const { getByTestId } = render(
        <Box>
            <div data-testid="child" />
        </Box>
    )
    expect(getByTestId("child")).toBeTruthy()
})

test("motion component accepts function ref", async () => {
    const Box = motion.div()

    const promise = new Promise(resolve => {
        const Component = () => <Box ref={resolve} />
        const { rerender } = render(<Component />)
        rerender(<Component />)
    })

    await expect(promise).resolves.toBeTruthy()
})

test("motion component accepts createRef", async () => {
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

test("motion component generates style attr from pose", () => {
    const Box = motion.div({
        default: { backgroundColor: "#fff" },
    })
    const { container } = render(<Box />)
    expect(container.firstChild).toHaveStyle("background-color: #fff")
})

test("motion component overwrites provided style attr with pose", () => {
    const Box = motion.div({
        default: { backgroundColor: "#fff" },
    })
    const { container } = render(<Box style={{ backgroundColor: "#000", left: 500 }} />)
    expect(container.firstChild).toHaveStyle("background-color: #fff; left: 500px")
})

test("motion component renders styled component and overwrites style", () => {
    const Box = styled.div`
        background: #fff;
    `
    const MotionBox = motion(Box)({
        default: { background: "#000" },
    })

    const { container } = render(<MotionBox style={{ background: "red" }} />)

    expect(container.firstChild).toHaveStyle("background: #000")
})

test("motion component takes styles of defined initial pose", () => {
    const Box = motion.div({
        default: { x: 0 },
        foo: { x: 100, transitionEnd: { display: "none" } },
    })
    const { container } = render(<Box pose="foo" />)
    expect(container.firstChild).toHaveStyle("transform: translateX(100px) translateZ(0); display: none;")
})

test("motion component doesn't forward pose prop", () => {
    const Box = motion.div({ default: {} })
    const { container } = render(<Box pose="default" />)
    expect(container.firstChild).not.toHaveAttribute("pose")
})

test("motion component accepts motion value", () => {
    const Box = motion.div()

    const Component = () => {
        const x = useMotionValue(800)
        return <Box x={x} />
    }

    const { container } = render(<Component />)
    expect(container.firstChild).toHaveStyle("transform: translateX(800px) translateZ(0)")
})

test("motion component fires onPoseComplete", async () => {
    const Box = motion.div({
        foo: { x: 100 },
        bar: { x: 0, transition: false },
    })

    const promise = new Promise(resolve => {
        const { rerender } = render(<Box pose="foo" />)
        rerender(
            <Box
                pose="bar"
                onPoseComplete={current => {
                    // We would ideally like to inspect the DOM itself at this point
                    // but the node seems to be unmounted after sync ops have flushed
                    expect(current.x).toBe(0)
                    resolve("fired")
                }}
            />
        )

        // To fire effects
        rerender(<Box pose="bar" />)
    })

    await expect(promise).resolves.toEqual("fired")
})

test("usePose changes pose", async () => {
    const Box = motion.div({
        foo: { scale: 3, transition: false },
        bar: { scale: 2, transition: false },
    })

    const promise = new Promise(resolve => {
        const Component = () => {
            const [pose, setPose] = usePose("foo")

            return <Box pose={pose} onClick={() => setPose("bar")} onPoseComplete={current => resolve(current.scale)} />
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild).toHaveStyle("transform: scale(3) translateZ(0)")

        rerender(<Component />)

        fireEvent.click(container.firstChild as Element)
    })

    await expect(promise).resolves.toEqual(2)
})

test("setPose.cycle cycles through poses", async () => {
    const Box = motion.div({
        foo: { scale: 3, transition: false },
        bar: { scale: 2, transition: false },
        foobar: { scale: 4, transition: false },
    })

    const promise = new Promise(resolve => {
        const Component = () => {
            const [pose, setPose] = usePose("bar", ["bar", "foo", "foobar"])

            return (
                <Box pose={pose} onClick={() => setPose.cycle()} onPoseComplete={current => resolve(current.scale)} />
            )
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild).toHaveStyle("transform: scale(2) translateZ(0)")

        rerender(<Component />)

        fireEvent.click(container.firstChild as Element)
        fireEvent.click(container.firstChild as Element)
    })

    await expect(promise).resolves.toEqual(4)
})

test("setPose.cycle starts at the initially-defined pose", async () => {
    const Box = motion.div({
        foo: { scale: 3, transition: false },
        bar: { scale: 2, transition: false },
        foobar: { scale: 4, transition: false },
    })

    const promise = new Promise(resolve => {
        const Component = () => {
            const [pose, setPose] = usePose("foo", ["bar", "foo", "foobar"])

            return (
                <Box pose={pose} onClick={() => setPose.cycle()} onPoseComplete={current => resolve(current.scale)} />
            )
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild).toHaveStyle("transform: scale(3) translateZ(0)")

        rerender(<Component />)

        fireEvent.click(container.firstChild as Element)
        fireEvent.click(container.firstChild as Element)
    })

    await expect(promise).resolves.toEqual(2)
})

test("useTransform", async () => {
    const Box = motion.div()

    const Component = () => {
        const x = useMotionValue(75)
        const y = useTransform(x, [0, 100], [200, 100])

        return <Box x={x} y={y} />
    }

    const { container } = render(<Component />)

    expect(container.firstChild).toHaveStyle("transform: translateX(75px) translateY(175px) translateZ(0)")
})
