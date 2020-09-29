import { render } from "../../../jest.setup"
import { motion, useMotionValue } from "../.."
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

    test("should updated transforms when passed a new value", () => {
        const Component = ({ x = 0 }) => {
            return <motion.div style={{ x }} />
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild as Element).toHaveStyle("transform: none")

        rerender(<Component x={1} />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(1px) translateZ(0)"
        )

        rerender(<Component x={0} />)

        expect(container.firstChild as Element).toHaveStyle("transform: none")
    })

    test("should update when passed new MotionValue", () => {
        const Component = ({ useX = false }) => {
            const x = useMotionValue(1)
            const y = useMotionValue(2)

            return (
                <motion.div
                    style={{
                        x: useX ? x : 0,
                        y: !useX ? y : 0,
                    }}
                />
            )
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(0px) translateY(2px) translateZ(0)"
        )

        rerender(<Component useX />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(1px) translateY(0px) translateZ(0)"
        )

        rerender(<Component />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(0px) translateY(2px) translateZ(0)"
        )
    })
})
