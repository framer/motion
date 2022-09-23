import { render } from "../../../jest.setup"
import { motion, motionValue, useMotionValue, useTransform } from "../.."
import { degreesToRadians } from "popmotion"
import * as React from "react"

describe("customValues prop", () => {
    test("Performs animations only on motion values provided via customValues", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const x = motionValue(0)
            const ref = React.createRef<HTMLDivElement>()
            const Component = () => (
                <motion.div
                    ref={ref}
                    customValues={{ x }}
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
                        customValues={{ x }}
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

    test("Doesn't render custom values", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const Component = () => {
                const ref = React.useRef<HTMLDivElement>(null)
                const distance = useMotionValue(100)
                const angle = useMotionValue(45)

                const x = useTransform([distance, angle], (latest) => {
                    return Math.floor(
                        Math.sin(degreesToRadians(latest[1] as number)) *
                            (latest[0] as number)
                    )
                })

                const y = useTransform([distance, angle], (latest) => {
                    return Math.floor(
                        Math.cos(degreesToRadians(latest[1] as number)) *
                            (latest[0] as number)
                    )
                })

                return (
                    <motion.div
                        ref={ref}
                        animate={{ distance: 50 } as any}
                        customValues={{ distance }}
                        style={{ x, y }}
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
            expect(x).toBe(35)
            expect(element).toHaveStyle(
                "transform: translateX(35px) translateY(35px) translateZ(0)"
            )
            expect(element).not.toHaveStyle("distance: 50")
        })
    })
})
