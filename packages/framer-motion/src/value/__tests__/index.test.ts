import { motionValue } from "../"
import { animate } from "../../animation/animate"
import { frame, frameData } from "../../frameloop"
import { time } from "../../frameloop/sync-time"
import { MotionGlobalConfig } from "../../utils/GlobalConfig"

async function wait(time: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, time)
    })
}

describe("motionValue", () => {
    test("change event is type-inferred", () => {
        const value = motionValue(0)

        value.on("change", (latest) => latest / 2)
    })

    test("change event fires when value changes", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("change", callback)

        expect(callback).not.toBeCalled()
        value.set(1)
        expect(callback).toBeCalledTimes(1)
        value.set(1)
        expect(callback).toBeCalledTimes(1)
    })

    test("renderRequest event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("renderRequest", callback)

        expect(callback).not.toBeCalled()
        value.set(1)
        expect(callback).toBeCalledTimes(1)
    })

    test("animationStart event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationStart", callback)

        expect(callback).not.toBeCalled()

        animate(value, 2)

        expect(callback).toBeCalledTimes(1)
    })

    test("animationCancel event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationCancel", callback)

        expect(callback).not.toBeCalled()

        animate(value, 1)
        animate(value, 2)

        expect(callback).toBeCalledTimes(1)
    })

    test("animationComplete event fires", async () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationComplete", callback)

        expect(callback).not.toBeCalled()

        animate(value, 1, { duration: 0.01 })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(callback).toBeCalledTimes(1)
                resolve()
            }, 100)
        })
    })

    test("When all change listeners removed, stop animation", async () => {
        const value = motionValue(0)

        const unsubscribeA = value.on("change", (latest) => latest)
        const unsubscribeB = value.on("change", (latest) => latest)

        animate(value, 100)

        expect(value.isAnimating()).toEqual(true)

        return new Promise<void>((resolve) => {
            unsubscribeA()
            expect(value.isAnimating()).toEqual(true)
            unsubscribeB()

            frame.postRender(() => {
                expect(value.isAnimating()).toEqual(false)
                resolve()
            })
        })
    })

    test("Velocity is calculated as zero when value is arbitrarily changed after creation", () => {
        const value = motionValue(0)
        frameData.isProcessing = false

        value.set(100)

        expect(value.getVelocity()).toEqual(0)
    })
})

describe("MotionValue velocity calculations", () => {
    beforeEach(() => {
        MotionGlobalConfig.useManualTiming = true
    })
    afterEach(() => {
        MotionGlobalConfig.useManualTiming = false
    })

    test("Velocity is correct when value changes each animation frame", () => {
        const value = motionValue(0)

        frameData.isProcessing = true
        time.set(0)
        value.set(0)
        time.set(10)
        value.set(1)
        expect(value.getVelocity()).toEqual(100)
        frameData.isProcessing = false
    })

    test("Velocity is correct when value changes twice within one frame", () => {
        time.set(0)
        const value = motionValue(0)

        frameData.isProcessing = true

        value.set(0)
        time.set(10)
        value.set(1)
        expect(value.getVelocity()).toEqual(100)
        value.set(2)
        expect(value.getVelocity()).toEqual(200)

        frameData.isProcessing = false
    })

    test("Velocity is capped to the last estimated frame when value hasn't been updated in a long time, and is then updated", () => {
        const value = motionValue(0)

        frameData.isProcessing = true

        value.set(0)
        time.set(10)
        value.set(1)
        time.set(1000)
        value.set(2)

        expect(Math.round(value.getVelocity())).toEqual(33)

        frameData.isProcessing = false
    })

    test("Velocity is capped to the last estimated frame when value hasn't been updated in a long time, and is then updated outside frameloop", async () => {
        const value = motionValue(0)

        frameData.isProcessing = true

        value.set(0)
        time.set(10)
        value.set(1)
        frameData.isProcessing = false
        await wait(1000)
        value.set(2)

        expect(Math.round(value.getVelocity())).toEqual(33)
    })

    test("Velocity is capped to the last estimated frame when value hasn't been updated in a long time, and is then double updated outside frameloop", async () => {
        const value = motionValue(0)

        frameData.isProcessing = true

        value.set(0)
        time.set(10)
        value.set(1)
        frameData.isProcessing = false
        await wait(1000)
        value.set(2)
        value.set(3)

        expect(Math.round(value.getVelocity())).toEqual(67)
    })

    test("Velocity is zero when queried a long time after the previous set", async () => {
        const value = motionValue(0)

        frameData.isProcessing = true

        value.set(0)
        time.set(10)
        value.set(1)
        frameData.isProcessing = false
        await wait(1000)

        expect(Math.round(value.getVelocity())).toEqual(0)
    })

    test("Velocity is correctly calculated after being set with setWithVelocity", async () => {
        const value = motionValue(0)
        value.set(100)
        value.setWithVelocity(200, 100, 10)
        expect(Math.round(value.getVelocity())).toBe(-10000)
    })

    test("Velocity can be measured even if initialised with undefined", async () => {
        const value = motionValue<undefined | number>(undefined)
        expect((value as any).canTrackVelocity).toBe(null)
        value.set(1)
        expect((value as any).canTrackVelocity).toBe(true)

        const value2 = motionValue<undefined | string>(undefined)
        value2.set("test")
        expect((value2 as any).canTrackVelocity).toBe(false)
    })
})
