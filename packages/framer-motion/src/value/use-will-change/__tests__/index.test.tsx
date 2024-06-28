import { render } from "../../../../jest.setup"
import { frame, motion, useMotionValue } from "../../.."
import { useEffect, useState } from "react"

describe("WillChangeMotionValue", () => {
    test("Don't apply will-change if nothing has been defined", async () => {
        const Component = () => <motion.div />
        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("will-change: auto;")
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
            return <motion.div animate={{ x: 100, backgroundColor: "#000" }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle(
            "will-change: transform,background-color;"
        )
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

        expect(container.firstChild).toHaveStyle("will-change: auto;")
    })

    test("Add externally-provided motion values", async () => {
        const Component = () => {
            const height = useMotionValue("height")
            return <motion.div style={{ height }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("will-change: height;")
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
        return new Promise<void>((resolve) => {
            const Component = () => {
                useEffect(() => {
                    setTimeout(() => {
                        expect(container.firstChild).toHaveStyle(
                            "will-change: transform;"
                        )
                        resolve()
                    }, 200)
                }, [])
                return (
                    <motion.div
                        transition={{
                            x: { duration: 0.1 },
                            y: { duration: 1 },
                        }}
                        initial={{ x: 0, y: 0 }}
                        animate={{ x: 100, y: 100 }}
                    />
                )
            }

            const { container } = render(<Component />)

            expect(container.firstChild).toHaveStyle("will-change: transform;")
        })
    })

    test("Doesn't remove transform if any transform is external motion value", async () => {
        let checkExternalMotionValue = () => {}

        return new Promise<void>((resolve) => {
            const Component = () => {
                useEffect(() => {
                    setTimeout(() => {
                        checkExternalMotionValue()
                        resolve()
                    }, 200)
                }, [])
                const y = useMotionValue(100)
                return (
                    <motion.div
                        transition={{
                            x: { duration: 0.1 },
                        }}
                        initial={{ x: 0 }}
                        animate={{ x: 100 }}
                        style={{ y }}
                    />
                )
            }

            const { container } = render(<Component />)

            checkExternalMotionValue = () => {
                expect(container.firstChild).toHaveStyle(
                    "will-change: transform;"
                )
            }

            expect(container.firstChild).toHaveStyle("will-change: transform;")
        })
    })

    test("Add values when they start animating", async () => {
        return new Promise<void>((resolve) => {
            const Component = () => {
                const [state, setState] = useState(false)

                useEffect(() => {
                    if (!state) setState(true)
                }, [state])

                return (
                    <motion.div
                        initial={false}
                        animate={state ? { x: 100 } : undefined}
                        onAnimationStart={() => {
                            frame.postRender(() => {
                                expect(container.firstChild).toHaveStyle(
                                    "will-change: transform;"
                                )
                                resolve()
                            })
                        }}
                    />
                )
            }

            const { container } = render(<Component />)

            expect(container.firstChild).toHaveStyle("will-change: auto;")
        })
    })
})
