import { mouseEnter, mouseLeave, render } from "../../../../jest.setup"
import * as React from "react"
import { Timeline } from "../index"
import { createRef } from "react"
import { motion } from "../../../render/dom/motion"
import { motionValue } from "../../../value"
import { TimelineSequence } from "../types"
import sync from "framesync"

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

    test("'progress' prop sets animation progress", async () => {
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

    test("'progress' prop scrubs through animation", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const progress = motionValue(0)
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.4, 0.6], x: [50, 100] }]]}
                    progress={progress}
                >
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            expect(ref.current).toHaveStyle(
                "opacity: 0.4; transform: translateX(50px) translateZ(0)"
            )

            progress.set(0.5)

            sync.postRender(() => resolve(ref.current))
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.5; transform: translateX(75px) translateZ(0)"
        )
    })

    test("Respects transition", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.4, 0.6], x: [50, 100] }]]}
                    transition={{ type: false }}
                >
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.6; transform: translateX(100px) translateZ(0)"
        )
    })

    test("Updates new timeline", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = ({ animate }: { animate: TimelineSequence }) => (
                <Timeline animate={animate} transition={{ type: false }}>
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const a: TimelineSequence = [
                ["box", { opacity: [0.4, 0.6], x: [50, 100] }],
            ]
            const b: TimelineSequence = [
                ["box", { opacity: [0.1, 0.2], x: [200, 300] }],
            ]
            const { rerender } = render(<Component animate={a} />)
            rerender(<Component animate={a} />)

            expect(ref.current).toHaveStyle(
                "opacity: 0.6; transform: translateX(100px) translateZ(0)"
            )

            rerender(<Component animate={b} />)
            rerender(<Component animate={b} />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.2; transform: translateX(300px) translateZ(0)"
        )
    })

    test("Updates new timeline with progress", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = ({ animate }: { animate: TimelineSequence }) => (
                <Timeline animate={animate} progress={motionValue(0.5)}>
                    <motion.div track="box" ref={ref} />
                </Timeline>
            )
            const a: TimelineSequence = [
                ["box", { opacity: [0.4, 0.6], x: [50, 100] }],
            ]
            const b: TimelineSequence = [
                ["box", { opacity: [0.1, 0.3], x: [200, 300] }],
            ]
            const { rerender } = render(<Component animate={a} />)
            rerender(<Component animate={a} />)
            rerender(<Component animate={b} />)
            rerender(<Component animate={b} />)

            resolve(ref.current)
        })

        await expect(promise).resolves.toHaveStyle(
            "opacity: 0.2; transform: translateX(250px) translateZ(0)"
        )
    })

    test("while* animates from timeline", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.1, 0.2] }]]}
                    transition={{ type: false }}
                >
                    <motion.div
                        track="box"
                        whileHover={{ opacity: 0.9 }}
                        transition={{ type: false }}
                        ref={ref}
                    />
                </Timeline>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            expect(ref.current).toHaveStyle("opacity: 0.2")

            mouseEnter(container.firstChild as Element)

            resolve(ref.current)
        })

        return expect(promise).resolves.toHaveStyle("opacity: 0.9")
    })

    test("while* animates back to the timeline", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.1, 0.2] }]]}
                    transition={{ type: false }}
                >
                    <motion.div
                        track="box"
                        whileHover={{ opacity: 0.9 }}
                        transition={{ type: false }}
                        ref={ref}
                    />
                </Timeline>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            expect(ref.current).toHaveStyle("opacity: 0.2")

            mouseEnter(container.firstChild as Element)

            expect(ref.current).toHaveStyle("opacity: 0.9")

            setTimeout(() => {
                mouseLeave(container.firstChild as Element)
                resolve(ref.current)
            }, 10)
        })

        return expect(promise).resolves.toHaveStyle("opacity: 0.2")
    })

    test("while* animates back to the latest timeline value", async () => {
        const promise = new Promise((resolve) => {
            const ref = createRef<HTMLDivElement>()
            const progress = motionValue(0)
            const Component = () => (
                <Timeline
                    animate={[["box", { opacity: [0.1, 0.2] }]]}
                    progress={progress}
                >
                    <motion.div
                        track="box"
                        whileHover={{ opacity: 0.9 }}
                        transition={{ type: false }}
                        ref={ref}
                    />
                </Timeline>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            expect(ref.current).toHaveStyle("opacity: 0.1")

            mouseEnter(container.firstChild as Element)

            expect(ref.current).toHaveStyle("opacity: 0.9")
            progress.set(1)

            sync.postRender(() => {
                setTimeout(() => {
                    mouseLeave(container.firstChild as Element)
                    resolve(ref.current)
                }, 10)
            })
        })

        return expect(promise).resolves.toHaveStyle("opacity: 0.2")
    })
})
