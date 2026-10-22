import { MotionGlobalConfig } from "motion-utils"
import { stepFrames } from "../../gestures/__tests__/utils"
import { render } from "../../jest.setup"
import { useAnimationFrame } from "../use-animation-frame"

afterEach(() => {
    MotionGlobalConfig.useManualTiming = false
})

describe("useAnimationFrame", () => {
    test("Fires every animation frame", async () => {
        /**
         * Step three 60fps frames on Motion's clock. Under load, jsdom's
         * frames arrive far enough apart that the third lands well past
         * 50ms. jsdom frames still fire between steps, but at the same
         * time, so the last call is the third stepped frame.
         */
        MotionGlobalConfig.useManualTiming = true
        const timesSinceStart: number[] = []
        const Component = () => {
            useAnimationFrame((timeSinceStart) => {
                timesSinceStart.push(timeSinceStart)
            })

            return null
        }
        const { rerender } = render(<Component />)
        rerender(<Component />)

        await stepFrames((3 * 1000) / 60)

        const totalFrameCount = timesSinceStart[timesSinceStart.length - 1]
        expect(timesSinceStart[0]).toBe(0)
        expect(totalFrameCount).toBeGreaterThan(25)
        expect(totalFrameCount).toBeLessThan(50)
    })

    test("Updates callback", async () => {
        const totalOutput = await new Promise<number[]>((resolve) => {
            const output: number[] = [0]
            const Component = ({ increment }: any) => {
                useAnimationFrame(() => {
                    output.push(output[output.length - 1] + increment)
                    if (output[output.length - 1] > 4) resolve(output)
                })

                return null
            }
            const { rerender } = render(<Component increment={1} />)
            rerender(<Component increment={2} />)
        })

        expect(totalOutput).toEqual([0, 2, 4, 6])
    })
})
