import * as React from "react"
import { render } from "../../../../jest.setup"
import { useWillChange } from ".."
import { motion } from "../../.."

describe("useWillChange", () => {
    test("Applies 'will-change: auto' by default", async () => {
        const Component = () => {
            const willChange = useWillChange()
            return <motion.div style={{ willChange }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("will-change: auto;")
    })

    test("Adds 'transform' when transform is animating", async () => {
        const Component = () => {
            const willChange = useWillChange()
            return (
                <motion.div
                    animate={{ x: 100, backgroundColor: "#000" }}
                    style={{ willChange }}
                />
            )
        }

        const { container } = render(<Component />)

        return new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    expect(container.firstChild).toHaveStyle(
                        "will-change: transform, background-color;"
                    )
                    resolve()
                })
            })
        })
    })

    test("Removes `transform` when all transforms finish animating", async () => {
        return new Promise<void>((resolve) => {
            const Component = () => {
                const willChange = useWillChange()
                return (
                    <motion.div
                        animate={{ x: 100 }}
                        style={{ willChange }}
                        transition={{ duration: 0.05 }}
                        onAnimationComplete={() => {
                            expect(container.firstChild).not.toHaveStyle(
                                "will-change: transform;"
                            )
                        }}
                    />
                )
            }

            const { container } = render(<Component />)
        })
    })
})
