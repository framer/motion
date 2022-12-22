import { render } from "../../../jest.setup"
import {
    motion,
    motionValue,
    pipe,
    useMotionTemplate,
    useMotionValue,
    useTransform,
} from "../.."
import * as React from "react"

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180

describe("values prop", () => {
    test("Performs animations only on motion values provided via values", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const x = motionValue(0)
            const ref = React.createRef<HTMLDivElement>()
            const Component = () => (
                <motion.div
                    ref={ref}
                    values={{ x }}
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
                        values={{ x }}
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
                        values={{ distance }}
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

    test("Prioritises transform over independent transforms", async () => {
        const promise = new Promise<[number, HTMLElement]>((resolve) => {
            const Component = () => {
                const x = useMotionValue(100)
                const scale = useMotionValue(2)
                const transform = useMotionTemplate`scale(${scale}) translateX(${x}px)`
                const ref = React.useRef<HTMLDivElement>(null)

                React.useInsertionEffect(() => {
                    return pipe(
                        x.on("animationCancel", () => {
                            // console.trace()
                            console.log("cancel")
                        }),
                        x.on("animationStart", () => console.log("start")),
                        x.on("animationComplete", () => console.log("complete"))
                    ) as VoidFunction
                })

                return (
                    <motion.div
                        ref={ref}
                        animate={{ x: 50 }}
                        transition={{ duration: 0.01 }}
                        values={{ x, scale }}
                        style={{ transform, scale }}
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
            expect(x).toBe(50)
            expect(element).toHaveStyle("transform: scale(2) translateX(50px)")
        })
    })

    test("Is defensive against undefined motion values", async () => {
        render(
            <motion.div
                animate={{ x: 1 }}
                initial={{ x: 0 }}
                values={{ x: undefined } as any}
            />
        )
    })
})
