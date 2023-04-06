import { motionValue } from "../../../value"
import { stagger } from "../../utils/stagger"
import { createAnimationsFromSequence } from "../create"

describe("createAnimationsFromSequence", () => {
    const a = document.createElement("div")
    const b = document.createElement("div")
    const c = document.createElement("div")
    const value = motionValue(0)

    test("It creates a single animation", () => {
        const animations = createAnimationsFromSequence([
            [
                a,
                { opacity: 1 },
                { duration: 1, ease: [0, 1, 2, 3], times: [0, 1] },
            ],
        ])

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 1,
            ease: [
                [0, 1, 2, 3],
                [0, 1, 2, 3],
            ],
            times: [0, 1],
        })
    })

    test("It orders grouped keyframes correctly", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }],
            [a, { x: [200, 300] }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, 200, 300])
    })

    test("It creates a single animation with defaults", () => {
        const animations = createAnimationsFromSequence([
            [a, { opacity: 1 }, { duration: 1 }],
        ])

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })
    })

    test("It creates a single animation with defaults - 2", () => {
        const animations = createAnimationsFromSequence([
            [
                a,
                { x: [100, 100, 200, 300] },
                { duration: 0.5, times: [0, 0.5, 0.7, 1], ease: "easeInOut" },
            ],
        ])
        expect(animations.get(a)!.keyframes.x).toEqual([100, 100, 200, 300])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 0.5,
            ease: ["easeInOut", "easeInOut", "easeInOut", "easeInOut"],
            times: [0, 0.5, 0.7, 1],
        })
    })

    test("It assigns the correct easing to the correct keyframes", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 1 }, { duration: 1, ease: "circIn" }],
            [a, { x: 2, opacity: 0 }, { duration: 1, ease: "backInOut" }],
        ])

        const { keyframes, transition } = animations.get(a)!
        expect(keyframes.x).toEqual([null, 1, null, 2])
        expect(transition.x).toEqual({
            duration: 2,
            ease: ["circIn", "circIn", "backInOut", "backInOut"],
            times: [0, 0.5, 0.5, 1],
        })
        expect(keyframes.opacity).toEqual([null, null, 0])
        expect(transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "backInOut", "backInOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It sequences one animation after another", () => {
        const animations = createAnimationsFromSequence([
            [
                a,
                { x: [100, 200, 300], opacity: 1 },
                { duration: 0.5, ease: "easeInOut" },
            ],
            [b, { y: 500 }, { duration: 0.5 }],
            [a, { x: 400 }, { duration: 1 }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([
            100,
            200,
            300,
            null,
            400,
        ])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeInOut", "easeInOut", "easeOut", "easeOut"],
            times: [0, 0.125, 0.25, 0.5, 1],
        })

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1, null])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeInOut"],
            times: [0, 0.25, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, null, 500, null])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.25, 0.5, 1],
        })
    })

    test("It accepts motion values", () => {
        const animations = createAnimationsFromSequence([
            [value, 100, { duration: 0.5 }],
        ])

        expect(animations.get(value)!.keyframes.default).toEqual([null, 100])
        expect(animations.get(value)!.transition.default).toEqual({
            duration: 0.5,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })
    })

    test("It accepts motion values keyframes", () => {
        const animations = createAnimationsFromSequence([
            [value, [50, 100], { duration: 0.5 }],
        ])

        expect(animations.get(value)!.keyframes.default).toEqual([50, 100])
        expect(animations.get(value)!.transition.default).toEqual({
            duration: 0.5,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })
    })

    test("It adds relative time to another animation", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 0.5, at: "+0.5" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, null, 500])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.75, 1],
        })
    })

    test("It adds moves the playhead back to the previous animation", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 0.5, at: "<" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, 500, null])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It adds subtracts time to another animation", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 0.5, at: "-1" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, 500, null])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It sets another animation at a specific time", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 0.5, at: 1.5 }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, null, 500])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.75, 1],
        })
    })

    test("It sets labels from strings", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            "my label",
            [a, { opacity: 0 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 1, at: "my label" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, null, 0])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, null, 500])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It sets annotated labels with absolute at times", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            { name: "my label", at: 0 },
            [a, { opacity: 0 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 1, at: "my label" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, null, 0])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, 500, null])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It sets annotated labels with relative at times", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 100 }, { duration: 1 }],
            { name: "my label", at: "-1" },
            [a, { opacity: 0 }, { duration: 1 }],
            [b, { y: 500 }, { duration: 1, at: "my label" }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 100, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, null, 0])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })

        expect(animations.get(b)!.keyframes.y).toEqual([null, 500, null])
        expect(animations.get(b)!.transition.y).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.5, 1],
        })
    })

    test("It advances time by the maximum defined in individual value options", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 1, y: 1 }, { duration: 1, y: { duration: 2 } }],
            [b, { y: 1 }, { duration: 0.5 }],
        ])

        expect(animations.get(a)!.transition.x.duration).toBe(2.5)
        expect(animations.get(b)!.transition.y.times?.[1]).toBe(0.8)
    })

    test("It creates multiple animations for multiple targets", () => {
        const animations = createAnimationsFromSequence([[[a, b, c], { x: 1 }]])

        expect(animations.get(a)).toBeTruthy()
        expect(animations.get(b)).toBeTruthy()
        expect(animations.get(c)).toBeTruthy()
    })

    test("It creates multiple animations, staggered", () => {
        const animations = createAnimationsFromSequence([
            [[a, b, c], { x: 1 }, { delay: stagger(1), duration: 1 }],
            [a, { opacity: 1 }, { duration: 1 }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 1, null])
        expect(animations.get(a)!.transition.x).toEqual({
            duration: 4,
            ease: ["easeOut", "easeOut"],
            times: [0, 0.25, 1],
        })
        expect(animations.get(a)!.keyframes.opacity).toEqual([null, null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 4,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.75, 1],
        })

        expect(animations.get(b)!.keyframes.x).toEqual([null, null, 1, null])
        expect(animations.get(b)!.transition.x).toEqual({
            duration: 4,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.25, 0.5, 1],
        })

        expect(animations.get(c)!.keyframes.x).toEqual([null, null, 1, null])
        expect(animations.get(c)!.transition.x).toEqual({
            duration: 4,
            ease: ["easeInOut", "easeOut", "easeOut"],
            times: [0, 0.5, 0.75, 1],
        })
    })

    test("It scales the whole animation based on the provided duration", () => {
        const animations = createAnimationsFromSequence(
            [
                [
                    a,
                    { opacity: 1 },
                    { duration: 1, ease: ["easeOut"], times: [0, 1] },
                ],
            ],
            { duration: 2 }
        )

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })
    })

    test("It passes timeline options to children", () => {
        const animations = createAnimationsFromSequence(
            [
                [
                    a,
                    { opacity: 1 },
                    { duration: 1, ease: ["easeOut"], times: [0, 1] },
                ],
            ],
            {
                duration: 2,
                repeat: Infinity,
                delay: 1,
            }
        )

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: ["easeOut", "easeOut"],
            times: [0, 1],
        })
    })

    test("It passes default options to children", () => {
        const animations = createAnimationsFromSequence(
            [[a, { opacity: 1 }, { times: [0, 1] }]],
            { defaultTransition: { duration: 2, ease: "easeInOut" } }
        )

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: ["easeInOut", "easeInOut"],
            times: [0, 1],
        })
    })

    test("It correctly passes easing cubic bezier array to children", () => {
        const animations = createAnimationsFromSequence(
            [[a, { opacity: 1 }, { times: [0, 1] }]],
            { defaultTransition: { duration: 2, ease: [0, 1, 2, 3] } }
        )

        expect(animations.get(a)!.keyframes.opacity).toEqual([null, 1])
        expect(animations.get(a)!.transition.opacity).toEqual({
            duration: 2,
            ease: [
                [0, 1, 2, 3],
                [0, 1, 2, 3],
            ],
            times: [0, 1],
        })
    })

    test("Adds spring as duration-based easing when only one keyframe defined", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 200 }, { duration: 1 }],
            [a, { x: 0 }, { duration: 1, type: "spring", bounce: 0 }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 200, null, 0])
        const { duration, ease, times } = animations.get(a)!.transition.x

        expect(duration).toEqual(2)
        expect(ease![0]).toEqual("easeOut")
        expect(ease![1]).toEqual("easeOut")
        expect(typeof ease![2]).toEqual("function")
        expect(times).toEqual([0, 0.5, 0.5, 1])
    })

    test("Adds springs as duration-based simulation when two keyframes defined", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 200 }, { duration: 1, ease: "linear" }],
            [a, { x: [200, 0] }, { duration: 1, type: "spring", bounce: 0 }],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 200, 200, 0])
        const { duration, ease, times } = animations.get(a)!.transition.x

        expect(duration).toEqual(2)
        expect(ease![0]).toEqual("linear")
        expect(ease![1]).toEqual("linear")
        expect(typeof ease![2]).toEqual("function")
        expect(times).toEqual([0, 0.5, 0.5, 1])
    })

    test("It correctly adds type: spring to timeline with simulated spring", () => {
        const animations = createAnimationsFromSequence([
            [a, { x: 200 }, { duration: 1 }],
            [
                a,
                { x: [100, 0] },
                { type: "spring", stiffness: 200, damping: 10 },
            ],
        ])

        expect(animations.get(a)!.keyframes.x).toEqual([null, 200, 100, 0])
        const { duration, ease, times } = animations.get(a)!.transition.x

        expect(duration).toEqual(2.2)
        expect(ease![0]).toEqual("easeOut")
        expect(ease![1]).toEqual("easeOut")
        expect(typeof ease![2]).toEqual("function")
        expect(times).toEqual([0, 0.45454545454545453, 0.45454545454545453, 1])
    })
})
