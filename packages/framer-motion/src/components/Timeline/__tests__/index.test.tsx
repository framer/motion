import { render } from "../../../../jest.setup"
import * as React from "react"
import { Timeline } from "../index"
import { createRef } from "react"
import { motion } from "../../../render/dom/motion"
import { motionValue } from "../../../value"

describe("Timeline", () => {
    test("Renders final keyframes if initial is false", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    initial={false}
                    animate={[["box", { opacity: [0.5, 0.9], x: [50, 100] }]]}
                >
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.9; transform: translateX(100px) translateZ(0)"
        )
    })

    test("Renders initial styles if defined as keyframes", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.5, 1], x: [50, 100] }]]}
                >
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.5; transform: translateX(50px) translateZ(0)"
        )
    })

    test("'progress' prop scrubs through animation", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.4, 0.6], x: [50, 100] }]]}
                    progress={motionValue(0.5)}
                >
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.5; transform: translateX(75px) translateZ(0)"
        )
    })
})
