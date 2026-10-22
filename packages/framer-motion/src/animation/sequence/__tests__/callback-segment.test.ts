import { motionValue } from "motion-dom"
import { MotionGlobalConfig } from "motion-utils"
import { stepFrames } from "../../../gestures/__tests__/utils"
import { animate } from "../../animate"

/**
 * #2205: run a callback partway through a sequence. A function segment
 * with `duration: 0` is called with 1 when the playhead passes its
 * position forwards and 0 when it passes back, whatever moves the playhead.
 */
describe("Sequence function segments as callbacks", () => {
    afterEach(() => {
        MotionGlobalConfig.useManualTiming = false
    })

    const createSequence = () => {
        const a = motionValue(0)
        const b = motionValue(0)
        const calls: number[] = []
        const animation = animate(
            [
                [a, 1, { duration: 1 }],
                [b, 1, { duration: 1 }],
                // Fires at the start of the previous segment, t = 1
                [(p: number) => calls.push(p), { at: "<", duration: 0 }],
            ],
            { defaultTransition: { ease: "linear" } }
        )
        return { a, b, calls, animation }
    }

    test("fires once, at its position, when played forwards", async () => {
        await stepFrames(0)
        const { b, calls, animation } = createSequence()

        expect(animation.duration).toBe(2)

        await stepFrames(900)
        expect(calls).toEqual([])

        await stepFrames(200)
        expect(calls).toEqual([1])
        expect(b.get()).toBeLessThan(0.2)

        await stepFrames(1000)
        expect(animation.state).toBe("finished")
        expect(calls).toEqual([1])
    })

    test("fires with 0 when played back past it", async () => {
        await stepFrames(0)
        const { calls, animation } = createSequence()
        animation.pause()
        animation.time = 1.5
        await stepFrames(50)
        expect(calls).toEqual([1])

        animation.speed = -1
        animation.play()
        await stepFrames(400)
        expect(calls).toEqual([1])

        await stepFrames(200)
        expect(calls).toEqual([1, 0])
    })

    test("follows speed", async () => {
        await stepFrames(0)
        const { calls, animation } = createSequence()
        animation.speed = 2

        await stepFrames(400)
        expect(calls).toEqual([])

        await stepFrames(200)
        expect(calls).toEqual([1])
    })

    test("follows seeking while paused", async () => {
        await stepFrames(0)
        const { calls, animation } = createSequence()
        animation.pause()

        animation.time = 0.5
        await stepFrames(50)
        expect(calls).toEqual([])

        animation.time = 1.5
        await stepFrames(50)
        expect(calls).toEqual([1])

        // Holding the playhead doesn't fire it again
        await stepFrames(200)
        expect(calls).toEqual([1])

        animation.time = 0.5
        await stepFrames(50)
        expect(calls).toEqual([1, 0])

        animation.time = 1.5
        await stepFrames(50)
        expect(calls).toEqual([1, 0, 1])
    })

    test("fires once per pass when the sequence repeats", async () => {
        await stepFrames(0)
        const calls: number[] = []
        animate(
            [
                [motionValue(0), 1, { duration: 1 }],
                [(p: number) => calls.push(p), { duration: 0 }],
                [motionValue(0), 1, { duration: 1 }],
            ],
            { repeat: 1 }
        )

        await stepFrames(1500)
        expect(calls).toEqual([1])

        // Wraps back to the start (0)...
        await stepFrames(1000)
        expect(calls).toEqual([1, 0])

        // ...then passes it again (1)
        await stepFrames(600)
        expect(calls).toEqual([1, 0, 1])
    })
})
