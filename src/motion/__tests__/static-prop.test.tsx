import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import { motionValue } from "../../value"

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

    test("it doesn't respond to updates in `initial`", () => {
        const { container, rerender } = render(
            <motion.div initial={{ x: 100 }} />
        )
        rerender(<motion.div initial={{ x: 200 }} />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("it responds to updates in `initial` if static", () => {
        const { container, rerender } = render(
            <motion.div static initial={{ x: 100 }} />
        )
        rerender(<motion.div static initial={{ x: 200 }} />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(200px)"
        )
    })

    test("it propagates changes in `initial` if static", () => {
        const variants = {
            visible: { opacity: 1 },
            hidden: { opacity: 0 },
        }

        const Component = ({ initial }: { initial: string }) => (
            <motion.div initial={initial} variants={variants} static>
                <motion.div data-testid="child" variants={variants} />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(
            <Component initial="visible" />
        )
        rerender(<Component initial="hidden" />)

        expect(container.firstChild as Element).toHaveStyle("opacity: 0")
        expect(getByTestId("child")).toHaveStyle("opacity: 0")
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
