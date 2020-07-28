import { render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { useMotionValue } from "../use-motion-value"
import { useTemplate } from "../use-template"
import { MotionValue, motionValue } from ".."

describe("useTemplate", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(1)
            const y = useMotionValue(2)
            const transform = useTemplate`translateX(${x}px) translateY(${y}px)`
            return <motion.div style={{ transform }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle(
            `transform: translateX(1px) translateY(2px)`
        )
    })

    test("responds to manual setting from parent value", async () => {
        const Component = () => {
            const x = useMotionValue(1)
            const y = useMotionValue(2)
            const transform = useTemplate`translateX(${x}px) translateY(${y}px)`

            React.useEffect(() => {
                x.set(10)
            }, [])

            return <motion.div style={{ transform }} />
        }

        const { container } = render(<Component />)
        const { firstChild } = container

        return new Promise(resolve => {
            setTimeout(() => {
                expect(firstChild).toHaveStyle(
                    `transform: translateX(10px) translateY(2px)`
                )
                resolve()
            }, 50)
        })
    })

    test("can be re-pointed to another `MotionValue`", async () => {
        const a = motionValue(1)
        const b = motionValue(2)
        const Component = ({ value }: { value: MotionValue }) => {
            const transform = useTemplate`translateX(${value}px)`
            return <motion.div style={{ transform }} />
        }

        const { container, rerender } = render(<Component value={a} />)

        expect(container.firstChild).toHaveStyle(`transform: translateX(1px)`)

        rerender(<Component value={b} />)

        expect(container.firstChild).toHaveStyle(`transform: translateX(2px)`)
    })
})
