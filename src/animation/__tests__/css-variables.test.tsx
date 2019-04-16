import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../../motion"
import * as React from "react"

describe("css variables", () => {
    test("has the css variable on animation end", async () => {
        const promise = new Promise<ChildNode | null>(resolve => {
            const resolvePromise = () => {
                requestAnimationFrame(() => resolve(container.firstChild))
            }

            const Component = () => {
                return (
                    <motion.div
                        style={{ "--from": "#09F", "--to": "#F00" } as any}
                        initial={{ background: "var(--from)" }}
                        animate={{ background: "var(--to)" }}
                        transition={{ duration: 0.01 }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle("background: var(--to);")
    })
})
