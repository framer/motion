/**
 * #2496: Driving Motion's frameloop without window.requestAnimationFrame,
 * e.g. from an XRSession's requestAnimationFrame during an immersive WebXR
 * session, where window.requestAnimationFrame stops firing.
 */

// window.requestAnimationFrame exists but never fires. The frameloop
// captures it when it's first imported, so stub it before requiring Motion.
const raf = jest.fn(() => 0)
;(window as any).requestAnimationFrame = raf

const { MotionGlobalConfig } = require("motion-utils")
const { frameData, frameSteps, processFrame, time } = require("motion-dom")
const { motion, processFrame: publicProcessFrame } = require("../../")
const { render } = require("../../jest.setup")

afterEach(() => {
    MotionGlobalConfig.useManualTiming = false
})

describe("driving the frameloop manually", () => {
    test("animates a motion component with the existing exports", () => {
        MotionGlobalConfig.useManualTiming = true

        const tick = (timestamp: number) => {
            frameData.delta = timestamp - frameData.timestamp
            frameData.timestamp = timestamp
            /**
             * Needed when processing several frames in one synchronous
             * block, as time.now() is cached until the next microtask.
             * Without it, motion components don't schedule a render.
             */
            time.set(timestamp)
            frameData.isProcessing = true
            for (const step in frameSteps) frameSteps[step].process(frameData)
            frameData.isProcessing = false
        }

        tick(0)
        const { container } = render(
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "linear" }}
            />
        )
        const element = container.firstChild as HTMLElement

        tick(500)
        expect(parseFloat(element.style.opacity)).toBeCloseTo(0.5)

        tick(1000)
        expect(element.style.opacity).toBe("1")
        expect(raf).toHaveBeenCalled()
    })

    test("processFrame animates a motion component", () => {
        expect(publicProcessFrame).toBe(processFrame)
        MotionGlobalConfig.useManualTiming = true

        processFrame(0)
        const { container } = render(
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "linear" }}
            />
        )
        const element = container.firstChild as HTMLElement

        // Several frames in one synchronous block, as a video renderer might
        processFrame(500)
        expect(parseFloat(element.style.opacity)).toBeCloseTo(0.5)

        processFrame(1000)
        expect(element.style.opacity).toBe("1")
    })
})

export {}
