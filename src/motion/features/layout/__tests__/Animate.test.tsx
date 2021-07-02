import { render } from "../../../../../jest.setup"
import * as React from "react"
import { AnimatePresence, AnimateSharedLayout, motion } from "../../../.."

describe("Layout Animate", () => {
    test("Continues layout exit transition across rerenders", async () => {
        const promise = new Promise<Element | null>((resolve) => {
            const Component = ({ open = false }) => {
                return (
                    <AnimateSharedLayout type="crossfade">
                        <motion.div
                            layoutId="item"
                            transition={{ duration: 0.1 }}
                            style={{
                                width: 10,
                                height: 10,
                            }}
                        />
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    layoutId="item"
                                    transition={{ duration: 3 }}
                                    className="modal"
                                    style={{
                                        width: 600,
                                        height: 600,
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </AnimateSharedLayout>
                )
            }

            const { container, rerender } = render(<Component open />)
            const modal = container.querySelector(".modal") as HTMLDivElement

            // Check it's animating out
            setTimeout(() => {
                expect(modal.style.opacity).not.toBe(1)
                expect(modal.style.opacity).not.toBe(0)
            }, 500)

            // Component rerenders (e.g. an internal state change)
            rerender(<Component />)

            // Check if it's still animating to the original transition
            setTimeout(() => {
                resolve(container.querySelector(".modal"))
            }, 1000)
        })

        const child = await promise
        expect(child).toBeTruthy()
        expect((child as HTMLDivElement).style.opacity).not.toBe(1)
        expect((child as HTMLDivElement).style.opacity).not.toBe(0)
    })
})
