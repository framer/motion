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

    test("Maps 'easeIn' to 'ease-in'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "easeIn",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "ease-in",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'easeOut' to 'ease-out'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "easeOut",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "ease-out",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'easeInOut' to 'ease-in-out'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "easeInOut",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "ease-in-out",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'circIn' to 'cubic-bezier(0, 0.65, 0.55, 1)'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "circIn",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "cubic-bezier(0, 0.65, 0.55, 1)",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'circOut' to 'cubic-bezier(0.55, 0, 1, 0.45)'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "circOut",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "cubic-bezier(0.55, 0, 1, 0.45)",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'backIn' to 'cubic-bezier(0.31, 0.01, 0.66, -0.59)'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "backIn",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "cubic-bezier(0.31, 0.01, 0.66, -0.59)",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Maps 'backOut' to 'cubic-bezier(0.33, 1.53, 0.69, 0.99)'", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    ease: "backOut",
                }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            { opacity: [0, 1], offset: undefined },
            {
                easing: "cubic-bezier(0.33, 1.53, 0.69, 0.99)",
                delay: -0,
                duration: 0.3,
                direction: "normal",
                fill: "both",
                iterations: 1,
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

    test("Pregenerates keyframes if ease is function", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ ease: () => 0.5, duration: 0.05 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            {
                opacity: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
                offset: undefined,
            },
            {
                delay: -0,
                direction: "normal",
                duration: 50,
                easing: "linear",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Pregenerates keyframes if ease is anticipate", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ ease: "anticipate", duration: 0.05 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            {
                opacity: [
                    0, -0.038019759996313955, 0.14036703066311026, 0.7875,
                    0.89296875, 0.899560546875,
                ],
                offset: undefined,
            },
            {
                delay: -0,
                direction: "normal",
                duration: 50,
                easing: "linear",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Pregenerates keyframes if ease is backInOut", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ ease: "backInOut", duration: 0.05 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            {
                opacity: [
                    0, -0.038019759996313955, 0.14036703066311026,
                    0.7596329693368897, 0.9380197599963139, 0.9,
                ],
                offset: undefined,
            },
            {
                delay: -0,
                direction: "normal",
                duration: 50,
                easing: "linear",
                fill: "both",
                iterations: 1,
            }
        )
    })

    test("Pregenerates keyframes if ease is circInOut", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ ease: "circInOut", duration: 0.05 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
        expect(ref.current!.animate).toBeCalledWith(
            {
                opacity: [
                    0, 0.36000000000000004, 0.440908153700972,
                    0.459091846299028, 0.5400000000000001, 0.9,
                ],
                offset: undefined,
            },
            {
                delay: -0,
                direction: "normal",
                duration: 50,
                easing: "linear",
                fill: "both",
                iterations: 1,
            }
        )
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
