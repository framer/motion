import "../../../jest.setup"
import { fireEvent, render } from "react-testing-library"
import { motion } from "../../motion"
import * as React from "react"
import { usePose } from "../use-pose"

describe("usePose", () => {
    test("usePose changes pose", async () => {
        const Box = motion.div({
            foo: { scale: 3, transition: false },
            bar: { scale: 2, transition: false },
        })

        const promise = new Promise(resolve => {
            const Component = () => {
                const [pose, setPose] = usePose<typeof Box>("foo")

                return (
                    <Box
                        pose={pose}
                        onClick={() => setPose("bar")}
                        onAnimationComplete={current => resolve(current.scale)}
                    />
                )
            }

            const { container, rerender } = render(<Component />)

            expect(container.firstChild).toHaveStyle("transform: scale(3) translateZ(0)")

            rerender(<Component />)

            fireEvent.click(container.firstChild as Element)
        })

        await expect(promise).resolves.toEqual(2)
    })
})

describe("setPose.cycle", () => {
    test("cycles through poses", async () => {
        const Box = motion.div({
            foo: { scale: 3, transition: false },
            bar: { scale: 2, transition: false },
            foobar: { scale: 4, transition: false },
        })

        const promise = new Promise(resolve => {
            const Component = () => {
                const [pose, setPose] = usePose("bar", ["bar", "foo", "foobar"])

                return (
                    <Box
                        pose={pose}
                        onClick={() => setPose.cycle()}
                        onAnimationComplete={current => resolve(current.scale)}
                    />
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

    test("starts at the initially-defined pose", async () => {
        const Box = motion.div({
            foo: { scale: 3, transition: false },
            bar: { scale: 2, transition: false },
            foobar: { scale: 4, transition: false },
        })

        const promise = new Promise(resolve => {
            const Component = () => {
                const [pose, setPose] = usePose("foo", ["bar", "foo", "foobar"])

                return (
                    <Box
                        pose={pose}
                        onClick={() => setPose.cycle()}
                        onAnimationComplete={current => resolve(current.scale)}
                    />
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
})
