import { render } from "../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { motion, stagger } from "../.."
import { animate } from "../animate"
import { useMotionValue } from "../../value/use-motion-value"
import { motionValue, MotionValue } from "../../value"
import { restoreWaapi, setupWaapi } from "../animators/waapi/__tests__/setup"

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

    test("Applies target keyframe when animation has finished", async () => {
        const div = document.createElement("div")
        const animation = animate(div, { opacity: 0.6 }, { duration })
        return animation.then(() => {
            expect(div).toHaveStyle("opacity: 0.6")
        })
    })

    test("Works with multiple elements", async () => {
        const div = document.createElement("div")
        const div2 = document.createElement("div")
        const animation = animate([div, div2], { opacity: 0.6 }, { duration })
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
})

describe("animate() with WAAPI", () => {
    beforeEach(() => {
        setupWaapi()
    })

    afterEach(() => {
        restoreWaapi()
    })

    test("Applies stagger", async () => {
        const a = document.createElement("div")
        const b = document.createElement("div")
        const animation = animate(
            [a, b],
            { opacity: [0.2, 0.5] },
            { delay: stagger(0.2) }
        )

        await animation.then(() => {
            expect(a.animate).toBeCalled()
            expect(a.animate).toBeCalledWith(
                { opacity: [0.2, 0.5], offset: undefined },
                {
                    delay: -0,
                    duration: 300,
                    easing: "cubic-bezier(0.25, 0.1, 0.35, 1)",
                    iterations: 1,
                    direction: "normal",
                    fill: "both",
                }
            )
            expect(b.animate).toBeCalled()
            expect(b.animate).toBeCalledWith(
                { opacity: [0.2, 0.5], offset: undefined },
                {
                    delay: 200,
                    duration: 300,
                    easing: "cubic-bezier(0.25, 0.1, 0.35, 1)",
                    iterations: 1,
                    direction: "normal",
                    fill: "both",
                }
            )
        })
    })
})
