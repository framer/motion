import { render } from "../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { motion } from "../.."
import { animate } from "../animate"
import { useMotionValue } from "../../value/use-motion-value"
import { motionValue, MotionValue } from "../../value"

const duration = 0.001

describe("animate", () => {
    test("correctly animates MotionValues", async () => {
        const promise = new Promise<[MotionValue, Element]>((resolve) => {
            const Component = () => {
                const x = useMotionValue(0)
                useEffect(() => {
                    animate(x, 200, {
                        duration: 0.1,
                        onComplete: () => {
                            resolve([x, element])
                        },
                    })
                }, [])
                return <motion.div style={{ x }} />
            }

            const { container, rerender } = render(<Component />)
            const element = container.firstChild as Element
            rerender(<Component />)
        })

        const [value, element] = await promise
        expect(value.get()).toBe(200)
        expect(element).toHaveStyle(
            "transform: translateX(200px) translateZ(0)"
        )
    })

    test("correctly animates normal values", async () => {
        const promise = new Promise<number>((resolve) => {
            const Component = () => {
                let latest = 0
                useEffect(() => {
                    animate(0, 200, {
                        duration: 0.1,
                        onUpdate: (v) => (latest = v),
                        onComplete: () => {
                            resolve(latest)
                        },
                    })
                }, [])
                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(promise).resolves.toBe(200)
    })

    test("correctly hydrates keyframes null with current MotionValue", async () => {
        const promise = new Promise<number[]>((resolve) => {
            const output: number[] = []
            const Component = () => {
                const x = useMotionValue(100)
                useEffect(() => {
                    animate(x, [null, 50], {
                        duration: 0.1,
                        onComplete: () => {
                            resolve(output)
                        },
                    })
                }, [])
                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        const output = await promise
        const incorrect = output.filter((v) => v < 50)
        // The default would be to animate from 0 here so if theres no values
        // less than 50 the keyframes were correctly hydrated
        expect(incorrect.length).toBe(0)
    })

    test("Accepts all overloads", () => {
        // Checking types only, these are expected to fail given the selector
        expect(() => {
            animate("div", { opacity: 0 })
            animate("div", { opacity: 0 }, { duration: 2 })
        }).toThrow()

        // Elements
        animate(document.createElement("div"), { opacity: 0 })
        animate(document.createElement("div"), { opacity: 0 }, { duration: 2 })

        // Values
        animate(0, 100, { duration: 2 })
        animate("#fff", "#000", { duration: 2 })
        animate("#fff", ["#000"], { duration: 2 })

        // MotionValues
        animate(motionValue(0), 100)
        animate(motionValue(0), [null, 100])
        animate(motionValue(0), [0, 100])
        animate(motionValue("#fff"), "#000")
        animate(motionValue("#fff"), [null, "#000"])
        animate(motionValue("#fff"), ["#fff", "#000"])
    })

    test.only("animates motion values in sequence", async () => {
        const a = motionValue(0)
        const b = motionValue(100)

        const aOutput: number[] = []
        const bOutput: number[] = []

        a.on("change", (v) => aOutput.push(v))
        b.on("change", (v) => bOutput.push(v))

        const animation = animate(
            [
                [a, [50, 100]],
                [b, 0],
            ],
            {
                defaultTransition: { ease: "linear", duration: 1 },
            }
        )

        animation.then(() => {
            expect(aOutput).toEqual([50, 100])
            expect(bOutput).toEqual([100, 50, 0])
        })
    })

    test("Applies target keyframe when animation has finished", async () => {
        const div = document.createElement("div")
        const animation = animate(
            div,
            { opacity: 0.6 },
            { duration, x: {}, "--css-var": {} }
        )
        return animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.6")
        })
    })

    test("Works with multiple elements", async () => {
        const div = document.createElement("div")
        const div2 = document.createElement("div")
        const animation = animate(
            [div, div2],
            { opacity: 0.6 },
            { duration, x: {}, "--css-var": {} }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.6")
            expect(div2).toHaveStyle("opacity: 0.6")
        })
    })

    test("Applies final target keyframe when animation has finished", async () => {
        const div = document.createElement("div")
        const animation = animate(div, { opacity: [0.2, 0.5] }, { duration })
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.5")
        })
    })

    test("Applies final target keyframe when animation has finished, repeat: reverse", async () => {
        const div = document.createElement("div")
        const animation = animate(
            div,
            { opacity: [0.2, 0.5] },
            {
                duration,
                repeat: 1,
                repeatType: "reverse",
            }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.2")
        })
    })

    test("Applies final target keyframe when animation has finished, repeat: reverse even", async () => {
        const div = document.createElement("div")
        const animation = animate(
            div,
            { opacity: [0.2, 0.5] },
            { duration, repeat: 2, repeatType: "reverse" }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.5")
        })
    })

    test("Applies final target keyframe when animation has finished, repeat: mirror", async () => {
        const div = document.createElement("div")
        const animation = animate(
            div,
            { opacity: [0.2, 0.5] },
            { duration, repeat: 1, repeatType: "mirror" }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.2")
        })
    })

    test("Applies final target keyframe when animation has finished, repeat: mirror even", async () => {
        const div = document.createElement("div")
        const animation = animate(
            div,
            { opacity: [0.2, 0.5] },
            { duration, repeat: 1, repeatType: "mirror" }
        )
        await animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.2")
        })
    })

    test("time sets and gets time", async () => {
        const div = document.createElement("div")
        const animation = animate(div, { x: 100 }, { duration: 10 })

        expect(animation.time).toBe(0)
        animation.time = 5
        expect(animation.time).toBe(5)
    })

    test(".time can be set to duration", async () => {
        const div = document.createElement("div")
        div.style.opacity = "0"
        const animation = animate(div, { opacity: 0.5 }, { duration: 1 })
        animation.pause()
        animation.time = 1

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(div).toHaveStyle("opacity: 0.5")
                resolve()
            }, 50)
        })
    })

    test("Is typed correctly", async () => {
        const div = document.createElement("div")
        animate(
            div,
            { "--css-var": 0 },
            { duration: 1, "--css-var": { duration: 1 } }
        )
        animate(
            div,
            { pathLength: 0 },
            { duration: 1, pathLength: { duration: 1 } }
        )
        animate(div, { r: 0 }, { duration: 1, r: { duration: 1 } })
    })
})
