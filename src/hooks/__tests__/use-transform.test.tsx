import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../../motion"
import * as React from "react"
import { useMotionValue } from "../../motion-value/use-motion-value"
import { useTransform } from "../use-transform"

test("useTransform", async () => {
    const Box = motion.div()

    const Component = () => {
        const x = useMotionValue(75)
        const y = useTransform(x, [0, 100], [200, 100])

        return <Box motionValues={{ x, y }} />
    }

    const { container } = render(<Component />)

    expect(container.firstChild).toHaveStyle("transform: translateX(75px) translateY(125px) translateZ(0)")
})
