import { render } from "../../../jest.setup"
import { motion, useMotionValue } from "../../"
import * as React from "react"
import { createRef } from "react"

/**
 * This assignment prevents Jest from complaining about
 * .animate() being undefined (as it's unsupported in node).
 */
Element.prototype.animate = (() => {}) as any

beforeEach(() => {
    jest.spyOn(Element.prototype, "animate").mockImplementation(
        (
            _keyframes: Keyframe[] | null | PropertyIndexedKeyframes,
            _options: KeyframeAnimationOptions | number | undefined
        ) => {
            return {} as any
        }
    )
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe("WAAPI animations", () => {
    test("opacity animates with WAAPI", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
    })

    test("WAAPI is called with expected arguments", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    repeat: 3,
                    repeatType: "reverse",
                    duration: 1,
                    delay: 2,
                    ease: [0, 0.2, 0.7, 1],
                    times: [0.2, 0.9],
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: [0.2, 0.9] },
            {
                delay: 2000,
                duration: 1000,
                easing: "cubic-bezier(0, 0.2, 0.7, 1)",
                iterations: 4,
                direction: "alternate",
                fill: "both",
            }
        )
    })

    test("WAAPI is called with pre-generated spring keyframes", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    type: "spring",
                    duration: 0.1,
                    bounce: 0,
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            {
                opacity: [
                    0, 0.23606867982504365, 0.5509083741195555,
                    0.7637684153125726, 0.8831910398786699, 0.9444771835619267,
                    0.9743215604668359, 0.9883608373299467, 0.9948051108537942,
                    0.9977094774280534, 1,
                ],
                offset: undefined,
            },
            {
                delay: -0,
                direction: "normal",
                duration: 100,
                easing: "linear",
                fill: "both",
                iterations: 1,
            }
        )
    })

    /**
     * TODO: We could not accelerate but scrub WAAPI animation if repeatDelay is defined
     */
    test("Doesn't animate with WAAPI if repeatDelay is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ repeatDelay: 1 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).not.toBeCalled()
    })

    test("Doesn't animate with WAAPI if repeatType is defined as mirror", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ repeatType: "mirror" }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).not.toBeCalled()
    })

    test("Doesn't animate with WAAPI if onUpdate is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onUpdate={() => {}}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).not.toBeCalled()
    })

    test("Doesn't animate with WAAPI if external motion value is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                style={{ opacity: useMotionValue(0) }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).not.toBeCalled()
    })
})
