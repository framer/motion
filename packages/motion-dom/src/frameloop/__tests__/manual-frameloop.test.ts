/**
 * #2496: Driving Motion's frameloop without window.requestAnimationFrame,
 * e.g. from an XRSession's requestAnimationFrame during an immersive WebXR
 * session (where window.requestAnimationFrame stops firing) or from a video
 * renderer that renders frame by frame.
 */

// Stand in for an immersive WebXR session: window.requestAnimationFrame
// exists but never fires. The frameloop captures it when it's first
// imported, so stub it before requiring Motion.
const raf = jest.fn(() => 0)
;(window as any).requestAnimationFrame = raf

const { MotionGlobalConfig } = require("motion-utils")
const {
    animateSingleValue,
    frameData,
    frame,
    frameSteps,
    motionValue,
    processFrame,
    styleEffect,
} = require("../../index")

afterEach(() => {
    MotionGlobalConfig.useManualTiming = false
    jest.restoreAllMocks()
})

const nextMicrotask = () => Promise.resolve()

const linear = { duration: 1, ease: "linear" } as const

describe("driving the frameloop manually", () => {
    test("is possible with the existing frameData and frameSteps exports", () => {
        MotionGlobalConfig.useManualTiming = true

        // What a user loop has to do today: reimplement the batcher.
        const tick = (timestamp: number) => {
            frameData.delta = timestamp - frameData.timestamp
            frameData.timestamp = timestamp
            frameData.isProcessing = true
            for (const step in frameSteps) frameSteps[step].process(frameData)
            frameData.isProcessing = false
        }

        tick(0)
        const element = document.createElement("div")
        const opacity = motionValue(0)
        styleEffect(element, { opacity })
        animateSingleValue(opacity, 1, linear)

        tick(500)
        expect(opacity.get()).toBeCloseTo(0.5)
        expect(element.style.opacity).toBe("0.5")

        tick(1000)
        expect(opacity.get()).toBe(1)
        expect(element.style.opacity).toBe("1")

        // Motion asked for a frame, but nothing relied on it firing.
        expect(raf).toHaveBeenCalled()
    })

    test("processFrame advances a timeline you control", () => {
        MotionGlobalConfig.useManualTiming = true

        processFrame(0)
        const element = document.createElement("div")
        const opacity = motionValue(0)
        styleEffect(element, { opacity })
        animateSingleValue(opacity, 1, linear)

        processFrame(500)
        expect(opacity.get()).toBeCloseTo(0.5)
        expect(element.style.opacity).toBe("0.5")

        processFrame(1000)
        expect(opacity.get()).toBe(1)
        expect(element.style.opacity).toBe("1")
    })

    test("processFrame runs every step in order with the frame's data", () => {
        MotionGlobalConfig.useManualTiming = true
        processFrame(100)

        const order: string[] = []
        for (const step in frameSteps) {
            frame[step]((data: any) => {
                expect(data.isProcessing).toBe(true)
                expect(data.timestamp).toBe(132)
                expect(data.delta).toBe(32)
                order.push(step)
            })
        }

        processFrame(132)
        expect(order).toEqual(Object.keys(frameSteps))
        expect(frameData.isProcessing).toBe(false)
    })

    test("processFrame defaults to the current time", async () => {
        const now = jest.spyOn(performance, "now").mockReturnValue(10000)
        await nextMicrotask()

        const opacity = motionValue(0)
        animateSingleValue(opacity, 1, linear)
        processFrame()
        expect(opacity.get()).toBe(0)

        await nextMicrotask()
        now.mockReturnValue(10500)
        processFrame()
        expect(opacity.get()).toBeCloseTo(0.5)

        // An XRFrame's time is on the same clock
        processFrame(10750)
        expect(opacity.get()).toBeCloseTo(0.75)
    })

    test("processFrame is ignored inside a frame", () => {
        MotionGlobalConfig.useManualTiming = true
        processFrame(0)
        frame.update(() => processFrame(5000))
        processFrame(16)
        expect(frameData.timestamp).toBe(16)
        expect(frameData.isProcessing).toBe(false)
    })
})
export {}
