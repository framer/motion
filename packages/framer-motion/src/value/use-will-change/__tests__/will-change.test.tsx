import { render } from "../../../../jest.setup"
import { MotionConfig, frame, motion, useMotionValue } from "../../.."
import { nextFrame } from "../../../gestures/__tests__/utils"
import { WillChangeMotionValue } from "../WillChangeMotionValue"

describe("WillChangeMotionValue", () => {
    test("Can manage transform alongside independent transforms", async () => {
        const willChange = new WillChangeMotionValue("auto")
        const removeTransform = willChange.add("transform")
        expect(willChange.get()).toBe("transform")
        removeTransform!()
        expect(willChange.get()).toBe("auto")
        const removeX = willChange.add("x")
        const removeY = willChange.add("y")
        expect(willChange.get()).toBe("transform")
        removeX!()
        expect(willChange.get()).toBe("transform")
        removeY!()
        expect(willChange.get()).toBe("auto")
    })
})

describe("willChange", () => {
    test("Don't apply will-change if nothing has been defined", async () => {
        const Component = () => <motion.div />
        const { container } = render(<Component />)
        expect(container.firstChild).not.toHaveStyle("will-change: auto;")
    })

    test("If will-change is set via style, render that value", async () => {
        const Component = () => {
            return <motion.div style={{ willChange: "transform" }} />
        }
        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })

    test("Renders values defined in animate on initial render", async () => {
        const Component = () => {
            const opacity = useMotionValue(0)
            return (
                <motion.div
                    animate={{ x: 100, backgroundColor: "#000" }}
                    style={{ opacity }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })

    test("Static mode: Doesn't render values defined in animate on initial render", async () => {
        const Component = () => {
            return (
                <MotionConfig isStatic>
                    <motion.div animate={{ x: 100, backgroundColor: "#000" }} />
                </MotionConfig>
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveStyle("will-change: transform;")
    })

    test("Renders values defined in animate on initial render", async () => {
        const Component = () => {
            return <motion.div animate={{ x: 100 }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })

    test("Doesn't render CSS variables or non-hardware accelerated values", async () => {
        const Component = () => {
            return (
                <motion.div
                    animate={
                        {
                            filter: "blur(10px)",
                            background: "#000",
                            "--test": "#000",
                        } as any
                    }
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("will-change: filter;")
    })

    test("Don't render values defined in animate on initial render if initial is false", async () => {
        const Component = () => {
            return (
                <motion.div
                    initial={false}
                    animate={{ x: 100, backgroundColor: "#000" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveStyle("will-change: auto;")
        expect(container.firstChild).not.toHaveStyle("will-change: transform;")
    })

    test("Externally-provided motion values are not added to will-change", async () => {
        const Component = () => {
            const opacity = useMotionValue(0)
            const height = useMotionValue(100)
            return <motion.div style={{ opacity, height }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveStyle("will-change: opacity;")
    })

    test("Static mode: Doesn't add externally-provided motion values", async () => {
        const Component = () => {
            const opacity = useMotionValue(0)
            const height = useMotionValue(100)
            return (
                <MotionConfig isStatic>
                    <motion.div style={{ opacity, height }} />
                </MotionConfig>
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).not.toHaveStyle("will-change: opacity;")
    })

    test("Removes values when they finish animating", async () => {
        return new Promise<void>((resolve) => {
            const Component = () => {
                return (
                    <motion.div
                        transition={{ duration: 0.1 }}
                        animate={{ x: 100 }}
                        onAnimationComplete={() => {
                            frame.postRender(() => {
                                expect(container.firstChild).toHaveStyle(
                                    "will-change: auto;"
                                )
                                resolve()
                            })
                        }}
                    />
                )
            }

            const { container } = render(<Component />)

            expect(container.firstChild).toHaveStyle("will-change: transform;")
        })
    })

    test("Doesn't remove transform when some transforms are still animating", async () => {
        const Component = ({ animate }: any) => (
            <motion.div
                initial={{ x: 0, y: 0 }}
                animate={animate}
                transition={{
                    x: { duration: 0.1 },
                    y: { duration: 1 },
                }}
            />
        )
        const { container, rerender } = render(<Component animate={{}} />)
        await nextFrame()

        expect(container.firstChild).not.toHaveStyle("will-change: transform;")
        rerender(<Component animate={{ x: 100, y: 100 }} />)

        await nextFrame()
        await nextFrame()
        await nextFrame()
        await nextFrame()
        await nextFrame()
        await nextFrame()

        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })

    test("Add values when they start animating", async () => {
        const Component = ({ animate }: any) => (
            <motion.div
                initial={false}
                animate={animate}
                transition={{ duration: 0.1 }}
            />
        )
        const { container, rerender } = render(<Component animate={{}} />)
        await nextFrame()

        expect(container.firstChild).not.toHaveStyle("will-change: transform;")
        rerender(<Component animate={{ x: 100 }} />)

        await nextFrame()

        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })

    test("Doesn't remove values when animation interrupted", async () => {
        const Component = ({ animate }: any) => (
            <motion.div
                initial={{ x: 0 }}
                animate={animate}
                transition={{ duration: 0.1 }}
            />
        )
        const { container, rerender } = render(<Component animate={{}} />)
        await nextFrame()

        expect(container.firstChild).not.toHaveStyle("will-change: transform;")
        rerender(<Component animate={{ x: 100 }} />)

        await nextFrame()

        expect(container.firstChild).toHaveStyle("will-change: transform;")
        rerender(<Component animate={{ x: 200 }} />)

        await nextFrame()
        expect(container.firstChild).toHaveStyle("will-change: transform;")
    })
})
