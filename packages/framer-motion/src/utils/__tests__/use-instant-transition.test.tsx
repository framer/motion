import { renderHook } from "@testing-library/react"
import { processFrame } from "motion-dom"
import { act, useEffect, useState } from "react"
import { motion, MotionGlobalConfig, motionValue } from "../.."
import { render } from "../../jest.setup"
import { useInstantTransition } from "../use-instant-transition"

describe("useInstantTransition", () => {
    test("Disables animations for a single render", () => {
        const xParent = motionValue(0)
        const xComponent = motionValue(0)
        const xChild = motionValue(0)

        const Parent = () => {
            const [state, setState] = useState(false)

            return (
                <motion.div
                    initial={false}
                    animate={{ x: state ? 50 : 0 }}
                    transition={{ duration: 10 }}
                    style={{ x: xParent }}
                >
                    <Component state={state} setState={setState} />
                </motion.div>
            )
        }

        const Component = ({ state, setState }: any) => {
            const startInstantTransition = useInstantTransition()

            useEffect(() => {
                startInstantTransition(() => act(() => setState(true)))
            }, [])

            return (
                <motion.div
                    initial={false}
                    animate={{ x: state ? 100 : 0 }}
                    transition={{ duration: 10 }}
                    style={{ x: xComponent }}
                >
                    <Child state={state} />
                </motion.div>
            )
        }

        const Child = ({ state }: any) => {
            return (
                <motion.div
                    initial={false}
                    animate={{ x: state ? 200 : 0 }}
                    transition={{ duration: 10 }}
                    style={{ x: xChild }}
                />
            )
        }

        const { rerender } = render(<Parent />)
        rerender(<Parent />)

        // Read the values 100ms worth of frames later
        stepFrames(6)

        expect([xParent.get(), xComponent.get(), xChild.get()]).toEqual([
            50, 100, 200,
        ])
    })

    test("Reenable animations on subsequent renders", () => {
        const xParent = motionValue(0)
        const xComponent = motionValue(0)
        const xChild = motionValue(0)
        let setParentState: (state: number) => void

        const Parent = () => {
            const [state, setState] = useState(0)
            setParentState = setState
            const xTargets = [0, 50, 100]
            return (
                <motion.div
                    initial={false}
                    animate={{ x: xTargets[state] }}
                    transition={{ duration: 10 }}
                    style={{ x: xParent }}
                >
                    <Component state={state} setState={setState} />
                </motion.div>
            )
        }

        const Component = ({ state, setState }: any) => {
            const startInstantTransition = useInstantTransition()
            const xTargets = [0, 100, 200]

            useEffect(() => {
                if (state === 0) {
                    startInstantTransition(() => act(() => setState(1)))
                }
            }, [state])

            return (
                <motion.div
                    initial={false}
                    animate={{ x: xTargets[state] }}
                    transition={{ duration: 10 }}
                    style={{ x: xComponent }}
                >
                    <Child state={state} />
                </motion.div>
            )
        }

        const Child = ({ state }: any) => {
            const xTargets = [0, 200, 400]

            return (
                <motion.div
                    initial={false}
                    animate={{ x: xTargets[state] }}
                    transition={{ duration: 10 }}
                    style={{ x: xChild }}
                />
            )
        }

        const { rerender } = render(<Parent />)
        rerender(<Parent />)

        // Wait 100ms worth of frames between the instant transition and the
        // next update, then again before reading the values.
        stepFrames(6)
        act(() => setParentState(2))
        stepFrames(6)

        expect([xParent.get(), xComponent.get(), xChild.get()]).not.toEqual([
            100, 200, 400,
        ])
    })

    test("transitions stay blocked when called on multiple frames back-to-back", () => {
        const { result } = renderInstantTransition()

        act(() => result.current(() => {}))
        expect(MotionGlobalConfig.instantAnimations).toBe(true)

        // On the next frame, call the callback again, as a
        // requestAnimationFrame callback would: after Motion's frame but
        // before React renders the update that frame scheduled.
        act(() => {
            processFrame()
            result.current(() => {})
        })

        step()
        // The countdown the hook started on mount ends on this frame, but
        // a newer call is pending, so animations stay instant.
        expect(MotionGlobalConfig.instantAnimations).toBe(true)

        step()
        // Finally 2 frames have passed since the final call to start an
        // instant transition, so we expect the state to be unblocked.
        expect(MotionGlobalConfig.instantAnimations).toBe(false)
    })

    test("transitions stay blocked when called again after the previous call rendered", () => {
        const { result } = renderInstantTransition()

        act(() => result.current(() => {}))
        // Render the first call and start its two frame countdown.
        step()

        act(() => result.current(() => {}))
        expect(MotionGlobalConfig.instantAnimations).toBe(true)

        step()
        expect(MotionGlobalConfig.instantAnimations).toBe(true)

        step()
        // The first call's countdown ends here, but mustn't unblock the
        // second call's transition.
        expect(MotionGlobalConfig.instantAnimations).toBe(true)

        step()
        // Two frames after the second call's render.
        expect(MotionGlobalConfig.instantAnimations).toBe(false)
    })
})

/**
 * Process one Motion frame, then let React render and run the effects it
 * scheduled before the next. Stepping frames synchronously keeps
 * jsdom's requestAnimationFrame timer from racing React's scheduler, which
 * under load can run a frame before React renders.
 */
const step = () => act(() => processFrame())

const stepFrames = (count: number) => {
    for (let i = 0; i < count; i++) step()
}

const renderInstantTransition = () => {
    // useInstantLayoutTransition only runs the callback with a projection root
    render(<motion.div />)
    return renderHook(() => useInstantTransition())
}
