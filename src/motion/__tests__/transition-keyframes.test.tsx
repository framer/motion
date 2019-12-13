import { render } from "../../../jest.setup"
import { motion } from ".."
import { hasUpdated } from "../../animation/use-animate-prop"
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

    test("hasUpdated detects only changed keyframe arrays", async () => {
        expect(hasUpdated(1, 2)).toBe(true)
        expect(hasUpdated([1, 2, 3], [1, 2, 3])).toBe(false)
        expect(hasUpdated([1, 2, 3], [1, 2, 4])).toBe(true)
    })
})
