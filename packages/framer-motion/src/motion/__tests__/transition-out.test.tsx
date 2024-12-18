import { render } from "../../../jest.setup"
import { motion } from "framer-motion"
import { fireEvent } from "@testing-library/react"
import { nextFrame } from "../../gestures/__tests__/utils"

describe("transition.out", () => {
    it("uses whileHover transition when exiting hover state", async () => {
        const onComplete = jest.fn()

        const { container } = render(
            <motion.div
                animate={{ opacity: 0, transition: { duration: 1 } }}
                transition={{ duration: 1 }}
                onAnimationComplete={onComplete}
                whileHover={{
                    opacity: 1,
                    transition: {
                        type: false,
                        out: true,
                        onComplete,
                    },
                }}
            />
        )

        // Enter hover
        fireEvent.mouseEnter(container.firstChild!)

        await nextFrame()

        // Exit hover - should use whileHover transition with type: false
        fireEvent.mouseLeave(container.firstChild!)

        // Wait for animation to complete
        await new Promise((resolve) => setTimeout(resolve, 100))

        expect(onComplete).toHaveBeenCalled()
    })

    it("uses whileTap out transition when tap ends before hover", async () => {
        const onComplete = jest.fn()

        const { container } = render(
            <motion.div
                whileHover={{
                    scale: 1.1,
                    transition: { duration: 1 },
                }}
                whileTap={{
                    scale: 0.9,
                    transition: {
                        type: false,
                        out: true,
                        onComplete,
                    },
                }}
                onAnimationComplete={onComplete}
            />
        )

        // Enter hover
        fireEvent.mouseEnter(container.firstChild!)

        await nextFrame()

        // Start tap
        fireEvent.mouseDown(container.firstChild!)

        await nextFrame()

        // End tap before ending hover
        fireEvent.mouseUp(container.firstChild!)

        await nextFrame()

        // Wait a frame to ensure animation has completed
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Should use whileTap out transition which is instant
        expect(onComplete).toHaveBeenCalled()

        // End hover
        fireEvent.mouseLeave(container.firstChild!)
    })
})
