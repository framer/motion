import { render } from "../../../jest.setup"
import * as React from "react"
import { useVelocity } from "../use-velocity"
import { useMotionValue } from "../use-motion-value"
import { animate } from "../../animation/animate"
import sync, { getFrameData } from "framesync"

const setFrameData = (interval: number, time: number) => {
    const data = getFrameData()
    data.timestamp = time
    data.delta = interval
}

const syncDriver = (interval = 10) => (update: (v: number) => void) => {
    let isRunning = true
    return {
        start: () => {
            let time = 0
            setTimeout(() => {
                update(0)
                while (isRunning) {
                    time += interval
                    setFrameData(interval, time)
                    update(interval)
                }
            }, 0)
        },
        stop: () => (isRunning = false),
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

                React.useEffect(() => {
                    x.onChange((v) => {
                        output.push(Math.round(v))
                    })
                    xVelocity.onChange((v) => {
                        outputVelocity.push(Math.round(v))
                    })
                    xAcceleration.onChange((v) => {
                        outputAcceleration.push(Math.round(v))
                    })

                    animate(x, 1000, {
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
                }, [])

                return null
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        await promise
        expect(output).toEqual([
            20,
            80,
            180,
            320,
            500,
            680,
            820,
            920,
            980,
            1000,
        ])
        expect(outputVelocity).toEqual([
            2000,
            6000,
            10000,
            14000,
            18000,
            18000,
            14000,
            10000,
            6000,
            2000,
            0,
        ])
        expect(outputAcceleration).toEqual([
            200000,
            400000,
            400000,
            400000,
            400000,
            -0,
            -400000,
            -400000,
            -400000,
            -50000,
            0,
        ])
    })
})
