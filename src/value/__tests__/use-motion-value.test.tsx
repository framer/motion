import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { motion } from "../../motion"
import { useMotionValue } from "../use-motion-value"

describe("useMotionValue", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("can be set manually", async () => {
        const Component = () => {
            const x = useMotionValue(100)

            x.set(500)

            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(500px) translateZ(0)"
        )
    })
})
