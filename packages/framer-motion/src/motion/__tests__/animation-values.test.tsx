import { render } from "../../../jest.setup"
import { motion, motionValue, useTransform } from "../../"
import * as React from "react"

describe("animationValues prop", () => {
    test("Performs animations only on motion values provided via animationValues", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const x = motionValue(0)
            const ref = React.createRef<HTMLDivElement>()
            const Component = () => (
                <motion.div
                    ref={ref}
                    animationValues={{ x }}
                    animate={{ x: 20 }}
                    transition={{ duration: 0.01 }}
                    onAnimationComplete={() => resolve([x.get(), ref.current!])}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await promise.then(([x, element]) => {
            expect(x).toBe(20)
            expect(element).not.toHaveStyle(
                "transform: translateX(20px) translateZ(0)"
            )
        })
    })

    test("Still correctly renders values provided via style", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const x = motionValue(0)
            const ref = React.createRef<HTMLDivElement>()
            const Component = () => {
                const doubleX = useTransform(x, [0, 1], [0, 2], {
                    clamp: false,
                })
                return (
                    <motion.div
                        ref={ref}
                        animationValues={{ x }}
                        animate={{ x: 20 }}
                        style={{ x: doubleX }}
                        transition={{ duration: 0.01 }}
                        onAnimationComplete={() =>
                            resolve([x.get(), ref.current!])
                        }
                    />
                )
            }
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await promise.then(([x, element]) => {
            expect(x).toBe(20)
            expect(element).toHaveStyle(
                "transform: translateX(40px) translateZ(0)"
            )
        })
    })
})
