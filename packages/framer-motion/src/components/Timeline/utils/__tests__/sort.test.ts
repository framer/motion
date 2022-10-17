import { UnresolvedValueSequence } from "../../types"
import { compareByTime } from "../sort"

describe("compareByTime", () => {
    test("Can be used to sort values by at time", () => {
        const sequence: UnresolvedValueSequence = [
            { value: 0, at: 300, easing: "easeInOut" },
            { value: 1, at: 0, easing: "easeInOut" },
            { value: 2, at: 301, easing: "easeInOut" },
            { value: 3, at: 299, easing: "easeInOut" },
            { value: 4, at: 40, easing: "easeInOut" },
        ]

        expect(sequence.sort(compareByTime)).toEqual([
            { value: 1, at: 0, easing: "easeInOut" },
            { value: 4, at: 40, easing: "easeInOut" },
            { value: 3, at: 299, easing: "easeInOut" },
            { value: 0, at: 300, easing: "easeInOut" },
            { value: 2, at: 301, easing: "easeInOut" },
        ])
    })

    test("Will correctly swap values so null comes second if at time the same", () => {
        const sequence: UnresolvedValueSequence = [
            { value: null, at: 300, easing: "easeInOut" },
            { value: 1, at: 0, easing: "easeInOut" },
            { value: 2, at: 300, easing: "easeInOut" },
            { value: 3, at: 299, easing: "easeInOut" },
            { value: 4, at: 40, easing: "easeInOut" },
        ]

        expect(sequence.sort(compareByTime)).toEqual([
            { value: 1, at: 0, easing: "easeInOut" },
            { value: 4, at: 40, easing: "easeInOut" },
            { value: 3, at: 299, easing: "easeInOut" },
            { value: 2, at: 300, easing: "easeInOut" },
            { value: null, at: 300, easing: "easeInOut" },
        ])
    })
})
