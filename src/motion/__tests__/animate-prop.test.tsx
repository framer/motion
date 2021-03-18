import { render } from "../../../jest.setup"
import { motion, motionValue } from "../../"
import * as React from "react"

describe("animate prop as object", () => {
    test("animates to set prop", async () => {
        const promise = new Promise((resolve) => {
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
        const promise = new Promise((resolve) => {
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
    test("fires onAnimationStart when animation begins", async () => {
        const promise = new Promise((resolve) => {
            const onStart = jest.fn()
            const onComplete = () => resolve(onStart)
            const Component = () => (
                <motion.div
                    animate={{ x: 20 }}
                    transition={{ type: false }}
                    onAnimationStart={onStart}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toBeCalledTimes(1)
    })
    test("uses transition on subsequent renders", async () => {
        const promise = new Promise((resolve) => {
            const x = motionValue(0)
            const Component = ({ animate }: any) => (
                <motion.div animate={animate} style={{ x }} />
            )
            const { rerender } = render(
                <Component animate={{ x: 10, transition: { type: false } }} />
            )
            rerender(
                <Component animate={{ x: 20, transition: { type: false } }} />
            )
            rerender(
                <Component animate={{ x: 30, transition: { type: false } }} />
            )
            requestAnimationFrame(() => resolve(x.get()))
        })
        return expect(promise).resolves.toBe(30)
    })
    test("transition accepts manual from value", async () => {
        const promise = new Promise((resolve) => {
            const output: number[] = []
            const Component = () => (
                <motion.div
                    initial={{ x: 100 }}
                    animate={{ x: 50 }}
                    transition={{ from: 0, ease: "linear" }}
                    onUpdate={(v: { x: number }) => output.push(v.x)}
                    onAnimationComplete={() => {
                        resolve(output.every((v) => v <= 50))
                    }}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toBe(true)
    })
    test("uses transitionEnd on subsequent renders", async () => {
        const promise = new Promise((resolve) => {
            const x = motionValue(0)
            const Component = ({ animate }: any) => (
                <motion.div animate={animate} style={{ x }} />
            )
            const { rerender } = render(
                <Component
                    animate={{
                        x: 10,
                        transition: { type: false },
                        transitionEnd: { x: 100 },
                    }}
                />
            )
            rerender(
                <Component
                    animate={{
                        x: 20,
                        transition: { type: false },
                        transitionEnd: { x: 200 },
                    }}
                />
            )
            rerender(
                <Component
                    animate={{
                        x: 30,
                        transition: { type: false },
                        transitionEnd: { x: 300 },
                    }}
                />
            )
            requestAnimationFrame(() => resolve(x.get()))
        })
        return expect(promise).resolves.toBe(300)
    })
    test("animates to set prop and preserves existing initial transform props", async () => {
        const promise = new Promise((resolve) => {
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
        const promise = new Promise((resolve) => {
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
                    animate={{ rotate: `${rotate}deg` }}
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
        const promise = new Promise((resolve) => {
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
        const promise = new Promise((resolve) => {
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
    test("will switch from non-animatable value to animatable value", async () => {
        const promise = new Promise((resolve) => {
            const onComplete = () => resolve(container.firstChild as Element)
            const Component = () => (
                <motion.div
                    animate={{ fontWeight: 100 }}
                    style={{ fontWeight: "normal" }}
                    onAnimationComplete={onComplete}
                />
            )
            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toHaveStyle("font-weight: 100")
    })
    test("doesn't animate zIndex", async () => {
        const promise = new Promise((resolve) => {
            const Component = () => <motion.div animate={{ zIndex: 100 }} />
            const { container, rerender } = render(<Component />)
            rerender(<Component />)
            requestAnimationFrame(() =>
                resolve(container.firstChild as Element)
            )
        })
        return expect(promise).resolves.toHaveStyle("z-index: 100")
    })
    test("respects repeatDelay prop", async () => {
        const promise = new Promise<number>((resolve) => {
            const x = motionValue(0)
            x.onChange(() => {
                setTimeout(() => resolve(x.get()), 50)
            })
            const Component = () => (
                <motion.div
                    animate={{ x: 20 }}
                    transition={{
                        x: {
                            type: "tween",
                            to: 50,
                            duration: 0,
                            repeatDelay: 0.1,
                            repeat: 1,
                            repeatType: "reverse",
                        },
                    }}
                    style={{ x }}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })
        return expect(promise).resolves.toBe(50)
    })
    test("animates previously unseen properties", () => {
        const Component = ({ animate }: any) => (
            <motion.div animate={animate} transition={{ type: false }} />
        )
        const { container, rerender } = render(
            <Component animate={{ x: 100 }} />
        )
        rerender(<Component animate={{ x: 100 }} />)
        rerender(<Component animate={{ y: 100 }} />)
        rerender(<Component animate={{ y: 100 }} />)
        return expect(container.firstChild as Element).toHaveStyle(
            "transform: translateX(0px) translateY(100px) translateZ(0)"
        )
    })

    test("animates previously unseen CSS variables", async () => {
        const promise = new Promise<string>((resolve) => {
            const Component = () => (
                <motion.div
                    style={{ "--foo": "#fff" } as any}
                    animate={{ "--foo": "#000" } as any}
                    onUpdate={(latest) => resolve(latest["--foo"] as string)}
                    transition={{ type: false }}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(promise).resolves.toBe("#000")
    })

    test("forces an animation to fallback if has been set to `null`", async () => {
        const promise = new Promise((resolve) => {
            const complete = () => resolve(true)
            const Component = ({ animate, onAnimationComplete }: any) => (
                <motion.div
                    animate={animate}
                    onAnimationComplete={onAnimationComplete}
                    transition={{ type: false }}
                />
            )
            const { container, rerender } = render(
                <Component animate={{ x: 100 }} />
            )
            rerender(<Component animate={{ x: null }} />)
            rerender(<Component animate={{ x: null }} />)
            expect(container.firstChild as Element).toHaveStyle(
                "transform: none"
            )
            rerender(
                <Component
                    animate={{ x: 100 }}
                    onAnimationComplete={complete}
                />
            )
            rerender(
                <Component
                    animate={{ x: 100 }}
                    onAnimationComplete={complete}
                />
            )
        })
        return expect(promise).resolves.toBe(true)
    })
    test("mount animation doesn't run if `initial={false}`", async () => {
        const onComplete = jest.fn()
        const x = motionValue(0)
        const y = motionValue(0)
        const z = motionValue(0)
        const promise = new Promise<void>((resolve) => {
            const Component = () => (
                <motion.div
                    initial={false}
                    animate={{
                        x: 20,
                        y: 20,
                        transitionEnd: { x: 10, z: 20 },
                    }}
                    transition={{ type: false }}
                    style={{ x, y, z }}
                    onAnimationComplete={onComplete}
                />
            )
            const { rerender } = render(<Component />)
            rerender(<Component />)
            setTimeout(() => resolve(), 10)
        })
        await promise
        expect(onComplete).not.toBeCalled()
        expect([x.get(), y.get(), z.get()]).toEqual([10, 20, 20])
    })
    test("unmount cancels active animations", async () => {
        const promise = new Promise((resolve) => {
            const onComplete = jest.fn()
            const Component = ({ isVisible }: any) =>
                isVisible && (
                    <motion.div
                        animate={{ x: 20 }}
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={() => onComplete()}
                    />
                )
            const { rerender } = render(<Component isVisible />)
            rerender(<Component isVisible />)
            setTimeout(() => {
                rerender(<Component isVisible={false} />)
                rerender(<Component isVisible={false} />)
            }, 100)
            setTimeout(() => {
                resolve(onComplete)
            }, 300)
        })
        return expect(promise).resolves.not.toBeCalled()
    })

    test("animate prop accepts pathOffset", () => {
        const Component = () => (
            <motion.div animate={{ pathOffset: 1, pathSpacing: 1 }} />
        )
        render(<Component />)
    })
})
