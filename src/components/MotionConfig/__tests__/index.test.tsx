import { render } from "../../../../jest.setup"
import { motion } from "../../../render/dom/motion"
import { MotionConfig } from "../"
import * as React from "react"

describe("custom properties", () => {
    test("renders", () => {
        const Component = () => {
            return (
                <MotionConfig isValidProp={(key) => key !== "data-foo"}>
                    <motion.div data-foo="bar" />
                </MotionConfig>
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveAttribute("data-foo")
    })
})
