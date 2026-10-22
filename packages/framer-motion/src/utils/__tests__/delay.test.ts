import { cancelFrame, delay, frame, frameData } from "motion-dom"
import { MotionGlobalConfig } from "motion-utils"

/**
 * Frames 20ms apart, however long the test machine takes between them.
 */
const advance = () => {
    frameData.timestamp += 20
}

describe("delay", () => {
    beforeEach(() => {
        MotionGlobalConfig.useManualTiming = true
        frameData.timestamp = 0
        frame.setup(advance, true)
    })

    afterEach(() => {
        cancelFrame(advance)
        MotionGlobalConfig.useManualTiming = false
    })

    test("resolves after provided duration", async () => {
        const start = frameData.timestamp
        const elapsed = await new Promise<number>((resolve) => {
            delay(() => resolve(frameData.timestamp - start), 50)
        })

        // The first frame at or after 50ms.
        expect(elapsed).toBe(60)
    })

    test("provides overshoot duration", async () => {
        const overshoot = await new Promise<number>((resolve) => {
            delay(resolve, 50)
        })

        expect(overshoot).toBe(10)
    })

    test("callback doesn't fire if cancelled", async () => {
        const callback = jest.fn()

        const cancelDelay = delay(callback, 10)

        return new Promise<void>((resolve) => {
            cancelDelay()
            setTimeout(() => {
                expect(callback).not.toBeCalled()
                resolve()
            }, 50)
        })
    })
})
