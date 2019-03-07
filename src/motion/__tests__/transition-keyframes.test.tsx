import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from ".."
import * as React from "react"

describe("keyframes transition", () => {
    test("keyframes as target", async () => {
        const promise = new Promise(resolve => {
            const resolveContainer = () => {
                requestAnimationFrame(() => {
                    resolve(container)
                })
            }

            const Component = () => (
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [10, 200] }}
                    transition={{ duration: 0.1 }}
                    onAnimationComplete={resolveContainer}
                />
            )

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        expect(promise).resolves.toHaveStyle(
            "transform: translateX(200px) translateZ(0)"
        )
    })
})
