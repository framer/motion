import { render } from "../../../jest.setup"
import { motion, useMotionValue } from "../.."
import * as React from "react"
import { MotionConfig } from "../context/MotionConfigContext"

describe("style prop", () => {
    test("should remove non-set styles", () => {
        function Component({ style }: any) {
            return (
                <MotionConfig isStatic>
                    <motion.div data-testid="child" style={style} />
                </MotionConfig>
            )
        }

        const { getByTestId, rerender } = render(
            <Component style={{ position: "absolute" }} />
        )

        expect(getByTestId("child")).toHaveStyle("position: absolute")

        rerender(<Component style={{}} />)

        expect(getByTestId("child")).not.toHaveStyle("position: absolute")
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
            const z = useMotionValue(3)

            return (
                <motion.div
                    style={{
                        x: useX ? x : 0,
                        y: !useX ? y : 0,
                        z: !useX ? z : 0,
                    }}
                />
            )
        }

        const { container, rerender } = render(<Component />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(0px) translateY(2px) translateZ(3px)"
        )

        rerender(<Component useX />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(1px) translateY(0px) translateZ(0px)"
        )

        rerender(<Component />)

        expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(0px) translateY(2px) translateZ(3px)"
        )
    })
})
