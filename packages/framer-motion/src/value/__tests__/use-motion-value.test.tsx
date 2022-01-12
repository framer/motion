import { render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { useMotionValue } from "../use-motion-value"
import { motionValue, MotionValue } from ".."

describe("useMotionValue", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    test("can be set manually", async () => {
        const Component = () => {
            const x = useMotionValue(100)

            x.set(500)

            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(500px) translateZ(0)"
        )
    })

    test("accepts new motion values", async () => {
        const a = motionValue(0)
        const b = motionValue(5)
        const Component = ({ x }: { x: MotionValue<number> }) => {
            return <motion.div style={{ x }} />
        }

        const { container, rerender } = render(<Component x={a} />)
        expect(container.firstChild).toHaveStyle("transform: none")
        rerender(<Component x={b} />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(5px) translateZ(0)"
        )
    })

    test("fires callbacks", async () => {
        const onChange = jest.fn()
        const onRenderRequest = jest.fn()
        const Component = () => {
            const x = useMotionValue(100)
            x.onChange(onChange)
            x.onRenderRequest(onRenderRequest)

            x.set(500)

            return <motion.div style={{ x }} />
        }

        render(<Component />)
        expect(onChange).toHaveBeenCalled()
        expect(onRenderRequest).toHaveBeenCalled()
    })

    test("is typed", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            return <motion.div style={{ x }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })
})
