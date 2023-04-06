import { fillWildcardKeyframes } from "../wildcards"

describe("fillWildcardKeyframes", () => {
    test("Fills null keyframes", () => {
        expect(fillWildcardKeyframes(0, [1, 2, 3])).toEqual([1, 2, 3])
        expect(fillWildcardKeyframes(0, [null, null, null])).toEqual([0, 0, 0])
        expect(fillWildcardKeyframes(0, [null, 1, null])).toEqual([0, 1, 1])
    })
})
