import { render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { fireEvent } from "@testing-library/react"
import { motionValue } from "../../value"

describe("focus", () => {
    test("whileFocus applied", async () => {
        const promise = new Promise((resolve) => {
            const opacity = motionValue(1)
            const Component = () => (
                <motion.div
                    whileFocus={{ opacity: 0 }}
                    transition={{ type: false }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            fireEvent.focus(container.firstChild as Element)

            resolve(opacity.get())
        })

        return expect(promise).resolves.toBe(0)
    })
})
