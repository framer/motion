import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"

describe("SVG path", () => {
    test("accepts custom transition prop", async () => {
        const element = await new Promise((resolve) => {
            const ref = React.createRef<SVGRectElement>()
            const Component = () => (
                <motion.rect
                    ref={ref}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.01 }}
                    onAnimationComplete={() => resolve(ref.current)}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(element).toHaveAttribute("stroke-dashoffset", "0px")
        expect(element).toHaveAttribute("stroke-dasharray", "1px 1px")
        expect(element).toHaveAttribute("pathLength", "1")
    })
})
