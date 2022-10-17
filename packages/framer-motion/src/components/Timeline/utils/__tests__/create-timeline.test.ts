import { createUnresolvedTimeline } from "../create-timeline"
import { defaultTransition } from "../defaults"

describe("createUnresolvedTimeline", () => {
    test("Single segment, default options", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }],
        ])

        expect(duration).toEqual(0.3)

        const { opacity } = tracks.box

        expect(opacity[0]).toEqual({
            value: null,
            at: 0,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 0.3,
            easing: defaultTransition.easing,
        })
    })

    test("Single segment, custom duration", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }, { duration: 1 }],
        ])

        expect(duration).toEqual(1)

        const { opacity } = tracks.box

        expect(opacity.length).toBe(2)

        expect(opacity[0]).toEqual({
            value: null,
            at: 0,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 1,
            easing: defaultTransition.easing,
        })
    })

    test("Single segment, custom duration and delay", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }, { duration: 1, delay: 0.5 }],
        ])

        expect(duration).toEqual(1.5)

        const { opacity } = tracks.box

        expect(opacity.length).toBe(2)

        expect(opacity[0]).toEqual({
            value: null,
            at: 0.5,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 1.5,
            easing: defaultTransition.easing,
        })
    })

    test("Single segment, custom duration, delay and absolute at", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }, { duration: 1, delay: 0.5, at: 0.5 }],
        ])

        expect(duration).toEqual(2)

        const { opacity } = tracks.box

        expect(opacity.length).toBe(2)

        expect(opacity[0]).toEqual({
            value: null,
            at: 1,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 2,
            easing: defaultTransition.easing,
        })
    })

    test("Creates timeline from two segments with default duration", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }],
            ["box", { opacity: 0 }],
        ])

        expect(duration).toEqual(0.6)

        const { opacity } = tracks.box
        expect(opacity.length).toBe(4)

        expect(opacity[0]).toEqual({
            value: null,
            at: 0,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 0.3,
            easing: defaultTransition.easing,
        })
        expect(opacity[2]).toEqual({
            value: null,
            at: 0.3,
            easing: defaultTransition.easing,
        })
        expect(opacity[3]).toEqual({
            value: 0,
            at: 0.6,
            easing: defaultTransition.easing,
        })
    })

    test("Fills initial keyframe if defined as array", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: [0.5, 1] }],
            ["box", { opacity: 0 }],
        ])

        expect(duration).toEqual(0.6)

        const { opacity } = tracks.box
        expect(opacity.length).toBe(4)
        expect(opacity[0]).toEqual({
            value: 0.5,
            at: 0,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 1,
            at: 0.3,
            easing: defaultTransition.easing,
        })
        expect(opacity[2]).toEqual({
            value: null,
            at: 0.3,
            easing: defaultTransition.easing,
        })
        expect(opacity[3]).toEqual({
            value: 0,
            at: 0.6,
            easing: defaultTransition.easing,
        })
    })

    test("Sorts keyframes by absolute time", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }, { duration: 0.5, at: 1 }],
            ["box", { opacity: 0 }, { duration: 0.5, at: 0 }],
        ])

        expect(duration).toEqual(1.5)

        const { opacity } = tracks.box
        expect(opacity.length).toBe(4)
        expect(opacity[0]).toEqual({
            value: null,
            at: 0,
            easing: defaultTransition.easing,
        })
        expect(opacity[1]).toEqual({
            value: 0,
            at: 0.5,
            easing: defaultTransition.easing,
        })
        expect(opacity[2]).toEqual({
            value: null,
            at: 1,
            easing: defaultTransition.easing,
        })
        expect(opacity[3]).toEqual({
            value: 1,
            at: 1.5,
            easing: defaultTransition.easing,
        })
    })
})
