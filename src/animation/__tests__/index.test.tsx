import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { useEffect } from "react"
import { motion } from "../../motion"
import { useAnimation } from "../use-animation"
import { useMotionValue } from "../../value/use-motion-value"
import { motionValue } from "../../value"

describe("useAnimation", () => {
    test("animates on mount", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()

                // We don't need to pass in x in normal use, but Jest will unmount the component
                // before we can measure its styles when we run async. Using motion values
                // just allows us to look at the results of animations when everything has wrapped up
                const x = useMotionValue(0)

                useEffect(() => {
                    animation.start({ x: 100 }).then(() => resolve(x.get()))
                }, [])

                return <motion.div animate={animation} style={{ x }} />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(100)
    })

    test("doesn't fire a pre-mount animation callback until the animation has finished", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()

                const x = useMotionValue(0)

                animation.start({ x: 100 }).then(() => resolve(x.get()))

                return <motion.div animate={animation} style={{ x }} />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(100)
    })

    test("fire's a component's onAnimationComplete", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()

                const x = useMotionValue(0)

                animation.start({ x: 100 })

                return (
                    <motion.div
                        animate={animation}
                        style={{ x }}
                        onAnimationComplete={() => resolve(x.get())}
                    />
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(100)
    })

    test("animates to named variants", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()
                const variants = {
                    foo: { x: 100 },
                }
                const x = useMotionValue(0)

                useEffect(() => {
                    animation.start("foo").then(() => resolve(x.get()))
                }, [])

                return (
                    <motion.div
                        variants={variants}
                        animate={animation}
                        style={{ x }}
                    />
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(100)
    })

    test("animates to named variants via variants prop", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()
                const x = useMotionValue(0)
                const variants = {
                    foo: { x: 200 },
                }

                useEffect(() => {
                    animation.start("foo").then(() => resolve(x.get()))
                }, [])

                return (
                    <motion.div
                        variants={variants}
                        animate={animation}
                        style={{ x }}
                    />
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(200)
    })

    test("propagates variants to children", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const controls = useAnimation()
                const variants = {
                    foo: { x: 100 },
                }

                const childVariants = {
                    foo: { backgroundColor: "#fff" },
                }

                const x = useMotionValue(0)
                const backgroundColor = useMotionValue("#000")

                useEffect(() => {
                    controls
                        .start("foo")
                        .then(() => resolve([x.get(), backgroundColor.get()]))
                }, [])

                return (
                    <motion.div
                        animate={controls}
                        variants={variants}
                        style={{ x }}
                    >
                        <motion.div
                            variants={childVariants}
                            style={{ backgroundColor }}
                        />
                    </motion.div>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return await expect(promise).resolves.toEqual([
            100,
            "rgba(255, 255, 255, 1)",
        ])
    })

    test("animates on mount", () => {
        const x = motionValue(0)
        const Component = () => {
            const controls = useAnimation()
            const variants = {
                test: { x: 100 },
            }

            controls.start("test", { type: false })
            return (
                <motion.div
                    style={{ x }}
                    variants={variants}
                    animate={controls}
                />
            )
        }
        const { rerender } = render(<Component />)
        rerender(<Component />)
        expect(x.get()).toBe(100)
    })

    test("accepts array of variants", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation()
                animation.start(["a", "b"])
                return <motion.div animate={animation} />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)

            resolve(true)
        })

        await expect(promise).resolves.not.toThrowError()
    })
})
