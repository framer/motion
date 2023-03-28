import { ValueSequence } from "../../types"
import { compareByTime } from "../sort"

describe("compareByTime", () => {
    test("Can be used to sort values by at time", () => {
        const sequence: ValueSequence = [
            { value: 0, at: 300 },
            { value: 1, at: 0 },
            { value: 2, at: 301 },
            { value: 3, at: 299 },
            { value: 4, at: 40 },
        ]

        expect(sequence.sort(compareByTime)).toEqual([
            { value: 1, at: 0 },
            { value: 4, at: 40 },
            { value: 3, at: 299 },
            { value: 0, at: 300 },
            { value: 2, at: 301 },
        ])
    })

    test("Will correctly swap values so null comes second if at time the same", () => {
        const sequence: ValueSequence = [
            { value: null, at: 300 },
            { value: 1, at: 0 },
            { value: 2, at: 300 },
            { value: 3, at: 299 },
            { value: 4, at: 40 },
        ]

        expect(sequence.sort(compareByTime)).toEqual([
            { value: 1, at: 0 },
            { value: 4, at: 40 },
            { value: 3, at: 299 },
            { value: 2, at: 300 },
            { value: null, at: 300 },
        ])
    })

    test("Will prefer to keep original order when at is the same", () => {
        const sequence: ValueSequence = [
            { value: 0, at: 0 },
            { value: 1, at: 100 },
            { value: 2, at: 100 },
            { value: 3, at: 200 },
        ]

        expect(sequence.sort(compareByTime)).toEqual([
            { value: 0, at: 0 },
            { value: 1, at: 100 },
            { value: 2, at: 100 },
            { value: 3, at: 200 },
        ])
    })
})
