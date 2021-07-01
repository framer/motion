import { render } from "../../../../jest.setup"
import * as React from "react"
import { AnimatePresence, AnimateSharedLayout, motion } from "../../.."

describe("AnimateSharedLayout", () => {
    test("Don't animate childs that are already present", async () => {
        const promise = new Promise<HTMLDivElement>((resolve) => {
            const Component = () => {
                return (
                    <AnimateSharedLayout type="crossfade">
                        <motion.div layoutId="thumbnail-or-modal" />
                        <AnimatePresence>
                            <motion.div
                                layoutId="thumbnail-or-modal"
                                className="modal"
                            />
                        </AnimatePresence>
                    </AnimateSharedLayout>
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            setTimeout(() => {
                resolve(container.querySelector(".modal") as HTMLDivElement)
            }, 500)
        })

        const element = await promise
        expect(element).not.toHaveStyle("opacity: 0")
    })
})
