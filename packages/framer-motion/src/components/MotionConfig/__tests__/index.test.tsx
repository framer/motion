import { render } from "../../../../jest.setup"
import { motion } from "../../../render/dom/motion"
import { MotionConfig } from "../"
import * as React from "react"

describe("custom properties", () => {
    test("renders", () => {
        const Component = () => {
            return (
                <MotionConfig isValidProp={(key) => key !== "data-foo"}>
                    <motion.div data-foo="bar" data-bar="foo" />
                </MotionConfig>
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveAttribute("data-foo")
        expect(container.firstChild).toHaveAttribute("data-bar")
    })

    test("reducedMotion warning fires in development mode", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})

        await new Promise<void>((resolve) => {
            const Component = () => {
                return (
                    <MotionConfig reducedMotion="always">
                        <motion.div
                            animate={{ opacity: 0.5 }}
                            transition={{ type: false }}
                            onAnimationComplete={() => resolve()}
                        />
                    </MotionConfig>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(warn).toHaveBeenCalled()

        warn.mockReset()
    })
})
