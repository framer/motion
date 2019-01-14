import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { motion } from "../../motion"
import { useMotionValue } from "../use-motion-value"
import { useTransformedValue } from "../use-transformed-value"

describe("useTransformedValue", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const opacity = useTransformedValue(x, [0, 200], [0, 1])
            return <motion.div style={{ x, opacity }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.5")
    })

    test("responds to manual setting from parent value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const opacity = useTransformedValue(x, [0, 200], [0, 1])

            x.set(20)

            return <motion.div style={{ x, opacity }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.1")
    })
})
