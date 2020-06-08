import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"

describe("style prop", () => {
    test("should remove non-set styles", () => {
        const { container, rerender } = render(
            <motion.div static style={{ position: "absolute" }} />
        )

        expect(container.firstChild as Element).toHaveStyle(
            "position: absolute"
        )

        rerender(<motion.div static style={{}} />)

        expect(container.firstChild as Element).not.toHaveStyle(
            "position: absolute"
        )
    })
})
