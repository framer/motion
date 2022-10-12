import { createUnresolvedTimeline } from "../create-timeline"

describe("createUnresolvedTimeline", () => {
    test("Creates timeline from single segment with default duration", () => {
        const { duration, tracks } = createUnresolvedTimeline([
            ["box", { opacity: 1 }],
        ])

        expect(duration).toEqual(0.3)
        const { keyframes, offsets, easing } = tracks.box
        expect(keyframes).toEqual([null, 1])
        expect(offsets).toEqual([0, 1])
        expect(easing).toEqual(["linear"])
    })
})
