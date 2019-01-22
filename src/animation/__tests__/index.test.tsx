import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { useEffect } from "react"
import { motion } from "../../motion"
import { useAnimation } from "../use-animation"
import { useMotionValue } from "../../value/use-motion-value"

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

    test("animates to named poses", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation({
                    foo: { x: 100 },
                })
                const x = useMotionValue(0)

                useEffect(() => {
                    animation.start("foo").then(() => resolve(x.get()))
                }, [])

                return <motion.div animate={animation} style={{ x }} />
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toBe(100)
    })

    test("propagates poses to children", async () => {
        const promise = new Promise(resolve => {
            const Component = () => {
                const animation = useAnimation({
                    foo: { x: 100 },
                })

                const childAnimation = useAnimation({
                    foo: { backgroundColor: "#fff" },
                })

                const x = useMotionValue(0)
                const backgroundColor = useMotionValue("#000")

                useEffect(() => {
                    animation.start("foo").then(() => resolve([x.get(), backgroundColor.get()]))
                }, [])

                return (
                    <motion.div animate={animation} style={{ x }}>
                        <motion.div animate={childAnimation} style={{ backgroundColor }} />
                    </motion.div>
                )
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await expect(promise).resolves.toEqual([100, "rgba(255, 255, 255, 1)"])
    })
})
