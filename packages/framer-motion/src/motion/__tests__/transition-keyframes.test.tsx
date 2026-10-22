import { checkVariantsDidChange } from "motion-dom"
import { motion, MotionGlobalConfig, motionValue } from "../.."
import { stepFrames } from "../../gestures/__tests__/utils"
import { render } from "../../jest.setup"

afterEach(() => {
    MotionGlobalConfig.useManualTiming = false
})

describe("keyframes transition", () => {
    test("keyframes as target", async () => {
        const promise = new Promise((resolve) => {
            const resolveContainer = () => {
                requestAnimationFrame(() => {
                    resolve(container)
                })
            }

            const Component = () => (
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [10, 200] }}
                    transition={{ duration: 0.1 }}
                    onAnimationComplete={resolveContainer}
                />
            )

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        expect(promise).resolves.toHaveStyle("transform: translateX(200px)")
    })

    test("hasUpdated detects only changed keyframe arrays", async () => {
        expect(checkVariantsDidChange("1", "2")).toBe(true)
        expect(checkVariantsDidChange(["1", "2", "3"], ["1", "2", "3"])).toBe(
            false
        )
        expect(checkVariantsDidChange(["1", "2", "3"], ["1", "2", "4"])).toBe(
            true
        )
    })

    test("keyframes with non-pixel values", async () => {
        const promise = new Promise((resolve) => {
            const resolveContainer = () => {
                requestAnimationFrame(() => {
                    resolve(container)
                })
            }

            const Component = () => (
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 0.1 }}
                    onAnimationComplete={resolveContainer}
                />
            )

            const { container, rerender } = render(<Component />)

            rerender(<Component />)
        })

        expect(promise).resolves.toHaveStyle("width: 100%;")
    })

    test("if initial={false}, take state of final keyframe", async () => {
        const xResult = await new Promise((resolve) => {
            const x = motionValue(0)
            const Component = ({ animate }: any) => {
                return (
                    <motion.div
                        initial={false}
                        animate={animate}
                        variants={{ a: { x: [0, 100] }, b: { x: [0, 100] } }}
                        transition={{ ease: () => 0.5, duration: 10 }}
                        style={{ x }}
                    />
                )
            }

            render(<Component animate="a" />)
            setTimeout(() => resolve(x.get()), 50)
        })

        expect(xResult).toBe(100)
    })

    test("keyframes animation reruns when variants change and keyframes are the same", async () => {
        const xResult = await new Promise((resolve) => {
            const x = motionValue(0)
            const Component = ({ animate }: any) => {
                return (
                    <motion.div
                        initial={false}
                        animate={animate}
                        variants={{
                            a: { x: [0, 100] },
                            b: { x: [0, 100], transition: { type: false } },
                        }}
                        transition={{ ease: () => 0.5, duration: 10 }}
                        style={{ x }}
                    />
                )
            }

            const { rerender } = render(<Component animate="a" />)
            rerender(<Component animate="b" />)
            rerender(<Component animate="a" />)
            setTimeout(() => resolve(x.get()), 50)
        })

        expect(xResult).toBe(50)
    })

    test("issue #2855: keyframes with shared values across variants rerun on each change", async () => {
        /**
         * Step Motion's clock: under load, a 100ms timer can fire before
         * the jsdom frames that run a 50ms animation.
         */
        MotionGlobalConfig.useManualTiming = true
        const z = motionValue(0)
        const updateCounts: number[] = []

        const Component = ({ animate }: any) => (
            <motion.div
                animate={animate}
                variants={{
                    start: { rotateZ: [0, 10, 0] },
                    end: { rotateZ: [0, 10, 0] },
                }}
                transition={{ duration: 0.05, ease: "linear" }}
                style={{ rotateZ: z }}
            />
        )

        const recordAndReset = async () => {
            let count = 0
            const unsubscribe = z.on("change", () => count++)
            await stepFrames(100)
            unsubscribe()
            updateCounts.push(count)
        }

        const { rerender } = render(<Component animate="start" />)
        await recordAndReset()

        rerender(<Component animate="end" />)
        await recordAndReset()

        rerender(<Component animate="start" />)
        await recordAndReset()

        expect(updateCounts[0]).toBeGreaterThan(0)
        expect(updateCounts[1]).toBeGreaterThan(0)
        expect(updateCounts[2]).toBeGreaterThan(0)
    })

    test("times works as expected", async () => {
        const values = await new Promise<number[]>((resolve) => {
            const output: number[] = []

            const Component = () => (
                <motion.div
                    animate={{ x: [50, 100, 200, 300] }}
                    transition={{ duration: 0.1, times: [0, 0, 1, 1] }}
                    onUpdate={(latest) =>
                        output.push(Math.round(latest.x as number))
                    }
                    onAnimationComplete={() => resolve(output)}
                    // Manually setting willChange to auto to prevent changes to willChange triggering onUpdate
                    style={{ willChange: "auto" }}
                />
            )

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(values[0] >= 100).toBe(true)
        expect(values[values.length - 2] <= 200).toBe(true)
    })
})
