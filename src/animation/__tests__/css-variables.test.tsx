import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../../motion"
import * as React from "react"

describe("css variables", () => {
    test("should animate css color variables", async () => {
        const promise = new Promise(resolve => {
            let isFirstFrame = true
            const Component = () => (
                <motion.div
                    style={{ "--from": "#09F", "--to": "#F00" } as any}
                    initial={{ background: "var(--from)" }}
                    animate={{ background: "var(--to)" }}
                    onUpdate={({ background }) => {
                        console.log("update")
                        if (isFirstFrame) {
                            isFirstFrame = false
                        } else {
                            resolve(background)
                        }
                    }}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        const resolvedAs = await promise

        // We're running this on the second frame to ensure and checking that
        // the resolved color *isn't* the start or target value. We want it to be an interpolation
        // of the two to ensure it's actually animating and not just switching between them.
        expect(resolvedAs).not.toBe("#09F")
        expect(resolvedAs).not.toBe("#F00")
        expect(resolvedAs).not.toBe("var(--from)")
        expect(resolvedAs).not.toBe("var(--to)")
    })
})
