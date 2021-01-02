import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"
import { motionValue } from "../../value"
import { MotionConfig } from "../context/MotionConfigContext"

describe("isStatic prop", () => {
    test("it prevents rendering of animated values", async () => {
        const promise = new Promise((resolve) => {
            const scale = motionValue(0)
            const Component = () => (
                <MotionConfig isStatic>
                    <motion.div
                        animate={{ scale: 2 }}
                        transition={{ type: false }}
                        style={{ scale }}
                    />
                </MotionConfig>
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => resolve(scale.get()), 50)
        })

        return expect(promise).resolves.toBe(0)
    })

    test("it permits updating transform values via style", () => {
        function Component({ x }: { x: number }) {
            return (
                <MotionConfig isStatic>
                    <motion.div data-testid="child" style={{ x }} />
                </MotionConfig>
            )
        }
        const { getByTestId, rerender } = render(<Component x={100} />)
        rerender(<Component x={200} />)

        expect(getByTestId("child") as Element).toHaveStyle(
            "transform: translateX(200px)"
        )
    })

    test("it removes unused styles", () => {
        function Component({ z }: { z?: number }) {
            return (
                <MotionConfig isStatic>
                    <motion.div data-testid="child" style={{ z }} />
                </MotionConfig>
            )
        }

        const { getByTestId, rerender } = render(<Component z={100} />)

        expect(getByTestId("child") as Element).toHaveStyle(
            "transform: translateZ(100px)"
        )

        rerender(<Component />)

        expect(getByTestId("child") as Element).not.toHaveStyle(
            "transform: translateZ(100px)"
        )
    })

    test("it doesn't respond to updates in `initial`", () => {
        function Component({ x }: { x?: number }) {
            return (
                <MotionConfig isStatic={false}>
                    <motion.div data-testid="child" initial={{ x }} />
                </MotionConfig>
            )
        }
        const { getByTestId, rerender } = render(<Component x={100} />)
        rerender(<Component x={200} />)

        expect(getByTestId("child") as Element).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("it responds to updates in `initial` if isStatic", () => {
        function Component({ x }: { x?: number }) {
            return (
                <MotionConfig isStatic>
                    <motion.div data-testid="child" initial={{ x }} />
                </MotionConfig>
            )
        }
        const { getByTestId, rerender } = render(<Component x={100} />)
        rerender(<Component x={200} />)

        expect(getByTestId("child") as Element).toHaveStyle(
            "transform: translateX(200px)"
        )
    })

    test("it doesn't override defined styles if values are removed", () => {
        function Component({
            initial,
        }: {
            initial?: { [key: string]: number }
        }) {
            return (
                <MotionConfig isStatic>
                    <motion.div
                        data-testid="child"
                        initial={initial}
                        style={{ opacity: 0.5 }}
                    />
                </MotionConfig>
            )
        }
        const { getByTestId, rerender } = render(
            <Component initial={{ opacity: 0.8 }} />
        )

        expect(getByTestId("child") as Element).toHaveStyle("opacity: 0.8")

        rerender(<Component />)

        expect(getByTestId("child") as Element).toHaveStyle("opacity: 0.5")
    })

    test("it propagates changes in `initial` if isStatic", () => {
        const variants = {
            visible: { opacity: 1 },
            hidden: { opacity: 0 },
        }

        const Component = ({ initial }: { initial: string }) => (
            <MotionConfig isStatic>
                <motion.div
                    data-testid="parent"
                    initial={initial}
                    variants={variants}
                >
                    <motion.div data-testid="child" variants={variants} />
                </motion.div>
            </MotionConfig>
        )

        const { getByTestId, rerender } = render(
            <Component initial="visible" />
        )
        rerender(<Component initial="hidden" />)

        expect(getByTestId("parent")).toHaveStyle("opacity: 0")
        expect(getByTestId("child")).toHaveStyle("opacity: 0")
    })

    test("it prevents rendering of children via context", async () => {
        const promise = new Promise((resolve) => {
            const scale = motionValue(0)
            const Component = () => (
                <MotionConfig isStatic>
                    <motion.div
                        animate={{ opacity: 0 }}
                        transition={{ type: false }}
                    >
                        <motion.button
                            animate={{ scale: 2 }}
                            transition={{ type: false }}
                            style={{ scale }}
                        />
                    </motion.div>
                </MotionConfig>
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => resolve(scale.get()), 50)
        })

        return expect(promise).resolves.toBe(0)
    })

    it("accepts externally-defined transition", () => {
        const transition = {
            staggerChildren: 10,
            when: "beforeChildren",
            staggerDirection: 1,
        }
        function Test() {
            return (
                <MotionConfig isStatic>
                    <motion.div data-testid="child" transition={transition} />
                </MotionConfig>
            )
        }

        const { getByTestId, rerender } = render(<Test />)

        rerender(<Test />)

        expect(getByTestId("child")).toBeTruthy()
    })
})
