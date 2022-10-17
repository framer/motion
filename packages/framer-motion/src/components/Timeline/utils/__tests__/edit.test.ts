import { UnresolvedValueSequence } from "../../types"
import { addKeyframes, eraseKeyframes } from "../edit"

describe("eraseKeyframes", () => {
    test("Erase keyframes between the specified time range", () => {
        const sequence: UnresolvedValueSequence = [
            { value: 1, at: 50 },
            { value: 2, at: 300 },
            { value: 3, at: 299 },
            { value: 4, at: 101 },
            { value: 5, at: 100 },
            { value: 6, at: 350 },
        ]

        eraseKeyframes(sequence, 100, 300)

        expect(sequence).toEqual([
            { value: 1, at: 50 },
            { value: 2, at: 300 },
            { value: 5, at: 100 },
            { value: 6, at: 350 },
        ])
    })
})

describe("addKeyframes", () => {
    test("Adds keyframes to sequence", () => {
        const sequence: UnresolvedValueSequence = [{ value: 1, at: 50 }]

        addKeyframes(
            sequence,
            [1, 2, 3, 4],
            [0, 1, 2, 3],
            [0, 0.1, 0.5, 1],
            500,
            1000
        )

        expect(sequence).toEqual([
            { value: 1, at: 50 },
            { value: 1, at: 500, easing: [0, 1, 2, 3] },
            { value: 2, at: 550, easing: [0, 1, 2, 3] },
            { value: 3, at: 750, easing: [0, 1, 2, 3] },
            { value: 4, at: 1000, easing: [0, 1, 2, 3] },
        ])

        addKeyframes(
            sequence,
            [5, 6, 7],
            ["ease-in", "ease-in-out"],
            [0, 0.5, 1],
            400,
            600
        )

        expect(sequence).toEqual([
            { value: 1, at: 50 },
            { value: 3, at: 750, easing: [0, 1, 2, 3] },
            { value: 4, at: 1000, easing: [0, 1, 2, 3] },
            { value: 5, at: 400, easing: "ease-in" },
            { value: 6, at: 500, easing: "ease-in-out" },
            { value: 7, at: 600, easing: "ease-in" },
        ])
    })
})
