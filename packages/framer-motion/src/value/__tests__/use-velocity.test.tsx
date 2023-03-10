import { render } from "../../../jest.setup"
import * as React from "react"
import { useVelocity } from "../use-velocity"
import { useMotionValue } from "../use-motion-value"
import { animate } from "../../animation/animate"
import { sync } from "../../frameloop"
import { frameData } from "../../frameloop/data"
import { useMotionValueEvent } from "../../utils/use-motion-value-event"

const setFrameData = (interval: number, time: number) => {
    frameData.timestamp = time
    frameData.delta = interval
}

const syncDriver =
    (interval = 10) =>
    (update: (v: number) => void) => {
        let isRunning = true
        let elapsed = 0

        return {
            start: () => {
                setTimeout(() => {
                    update(elapsed)
                    while (isRunning) {
                        elapsed += interval
                        setFrameData(interval, elapsed)
                        update(elapsed)
                    }
                }, 0)
            },
            stop: () => (isRunning = false),
            now: () => elapsed,
        }
    }

describe("useVelocity", () => {
    test("creates a motion value that updates with the velocity of the provided motion value", async () => {
        const output: number[] = []
        const outputVelocity: number[] = []
        const outputAcceleration: number[] = []

        const promise = new Promise((resolve) => {
            const Component = () => {
                const x = useMotionValue(0)
                const xVelocity = useVelocity(x)
                const xAcceleration = useVelocity(xVelocity)

                useMotionValueEvent(x, "change", (v) =>
                    output.push(Math.round(v))
                )
                useMotionValueEvent(xVelocity, "change", (v) =>
                    outputVelocity.push(Math.round(v))
                )
                useMotionValueEvent(xAcceleration, "change", (v) =>
                    outputAcceleration.push(Math.round(v))
                )

                React.useEffect(() => {
                    const animation = animate(x, 1000, {
                        duration: 0.1,
                        ease: "easeInOut",
                        driver: syncDriver(),
                        onComplete: () => {
                            /**
                             * This stack is basically waiting x frames to allow
                             * the derived values to "settle", as when a motion value
                             * is set it sets a velocity check for the end of the following frame.
                             * The more derivatives we have the more frames it'll take for
                             * all values to settle.
                             */
                            sync.postRender(() => {
                                setFrameData(10, 110)
                                sync.postRender(() => {
                                    setFrameData(10, 120)
                                    sync.postRender(() => {
                                        setFrameData(10, 130)
                                        sync.postRender(() => {
                                            setFrameData(10, 140)
                                            resolve(undefined)
                                        })
                                    })
                                })
                            })
                        },
                    } as any)

                    return () => {
                        animation.stop()
                    }
                }, [])

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await promise
        expect(output).toEqual([
            20, 80, 180, 320, 500, 680, 820, 920, 980, 1000,
        ])
        expect(outputVelocity).toEqual([
            2000, 6000, 10000, 14000, 18000, 18000, 14000, 10000, 6000, 2000, 0,
        ])
        expect(outputAcceleration).toEqual([
            200000, 400000, 400000, 400000, 400000, -0, -400000, -400000,
            -400000, -50000, 0,
        ])
    })
})
