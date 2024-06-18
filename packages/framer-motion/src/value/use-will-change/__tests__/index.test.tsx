import { render } from "../../../../jest.setup"
import { frame, motion, useMotionValue } from "../../.."
import { useEffect, useState } from "react"

/**
 * - When drag starts and stops
 * - opacity/transform for optimised appear animations/initial animation
 * - when animation starts and stops
 * - Externally provided motion value or style
 * - When an animation is interrupted
 */

describe("WillChangeMotionValue", () => {
    test.only("If no animations are defined then don't apply will-change", async () => {
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
            return <motion.div animate={{ x: 100, backgroundColor: "#000" }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle(
            "will-change: transform, background-color;"
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
                        animate={{ x: 100, backgroundColor: "#000" }}
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
