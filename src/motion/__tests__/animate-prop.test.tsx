import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from "../"
import * as React from "react"
import { motionValue } from "../../value"

describe("animate prop as object", () => {
    test("animates to set prop", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const Component = () => (
                <motion.div
                    animate={{ x: 20 }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toBe(20)
    })

    test("accepts custom transition prop", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const onComplete = () => resolve(x.get())
            const Component = () => (
                <motion.div
                    animate={{ x: 20 }}
                    transition={{ x: { type: "tween", to: 50 } }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toBe(50)
    })

    test("animates to set prop and preserves existing initial transform props", async () => {
        const promise = new Promise(resolve => {
            const onComplete = () => {
                // Animation complete currently fires when animation is complete, before the actual render
                setTimeout(() => resolve(container.firstChild as any), 20)
            }
            const { container, rerender } = render(
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ x: 20 }}
                    onAnimationComplete={onComplete}
                />
            )
            rerender(
                <motion.div
                    animate={{ x: 20 }}
                    onAnimationComplete={onComplete}
                />
            )
        })

        return expect(promise).resolves.toHaveStyle(
            "transform: translateX(20px) scale(0) translateZ(0)"
        )
    })

    test("style doesnt overwrite in subsequent renders", async () => {
        const promise = new Promise(resolve => {
            const history: number[] = []
            const onAnimationComplete = () => {
                setTimeout(() => {
                    let styleHasOverridden = false
                    let prev = 0

                    for (let i = 0; i < history.length; i++) {
                        if (history[i] < prev) {
                            styleHasOverridden = true
                            break
                        }

                        prev = history[i]
                    }

                    resolve(styleHasOverridden)
                }, 20)
            }
            const Component = ({ rotate, onComplete }: any) => (
                <motion.div
                    animate={{ rotate }}
                    transition={{ duration: 0.05 }}
                    style={{ rotate: "0deg" }}
                    onUpdate={({ rotate }) =>
                        history.push(parseFloat(rotate as string))
                    }
                    onAnimationComplete={onComplete}
                />
            )

            const { rerender } = render(<Component rotate={1000} />)

            rerender(<Component rotate={1000} />)
            setTimeout(() => {
                rerender(
                    <Component rotate={1001} onComplete={onAnimationComplete} />
                )
            }, 120)
        })

        return expect(promise).resolves.toBe(false)
    })

    test("applies custom transform", async () => {
        const promise = new Promise(resolve => {
            const resolveContainer = () => {
                requestAnimationFrame(() => {
                    resolve(container)
                })
            }

            const Component = () => (
                <motion.div
                    initial={{ x: 10 }}
                    animate={{ x: 30 }}
                    transition={{ duration: 10 }}
                    transformTemplate={({ x }, generated) =>
                        `translateY(${x}) ${generated}`
                    }
                    onAnimationComplete={resolveContainer}
                />
            )

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        expect(promise).resolves.toHaveStyle(
            "transform: translateX(30px) translateX(30px) translateZ(0)"
        )
    })

    test("keyframes - accepts ease as an array", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const easingListener = jest.fn()
            const easing = (v: number) => {
                easingListener()
                return v
            }
            const onComplete = () => resolve(easingListener)
            const Component = () => (
                <motion.div
                    animate={{ x: [0, 1, 2] }}
                    transition={{ ease: [easing, easing], duration: 0.1 }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveBeenCalled()
    })

    test("tween - accepts ease as an array", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const easingListener = jest.fn()
            const easing = (v: number) => {
                easingListener()
                return v
            }
            const onComplete = () => resolve(easingListener)
            const Component = () => (
                <motion.div
                    animate={{ x: 2 }}
                    transition={{ ease: [easing, easing], duration: 0.1 }}
                    style={{ x }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveBeenCalled()
    })
})
