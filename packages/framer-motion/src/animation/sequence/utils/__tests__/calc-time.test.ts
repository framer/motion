import { calcNextTime } from "../calc-time"

describe("calcNextTime", () => {
    test("Correctly returns a new time based on the past arguments", () => {
        const labels = new Map()
        labels.set("foo", 2)

        // Absolute time
        expect(calcNextTime(1, 0.2, 100, labels)).toBe(0.2)
        expect(calcNextTime(2, 0.2, 100, labels)).toBe(0.2)

        // Label
        expect(calcNextTime(4, "foo", 100, labels)).toBe(2)
        expect(calcNextTime(4, "bar", 100, labels)).toBe(4)

        // Relative time
        expect(calcNextTime(5, "-1", 100, labels)).toBe(4)
        expect(calcNextTime(5, "+1", 100, labels)).toBe(6)
        expect(calcNextTime(5, "-7", 100, labels)).toBe(0)

        // Previous
        expect(calcNextTime(5, "<", 100, labels)).toBe(100)

        // Relative to previous
        expect(calcNextTime(5, "<1", 100, labels)).toBe(101)
        expect(calcNextTime(5, "<+1", 100, labels)).toBe(101)
        expect(calcNextTime(5, "<-1", 100, labels)).toBe(99)
        expect(calcNextTime(5, "<2.5", 100, labels)).toBe(102.5)
        expect(calcNextTime(5, "<+2.5", 100, labels)).toBe(102.5)
        expect(calcNextTime(5, "<-2.5", 100, labels)).toBe(97.5)
        expect(calcNextTime(5, "<-150", 100, labels)).toBe(0)
    })

    test("Resolves times relative to a label", () => {
        const labels = new Map()
        labels.set("foo", 2)
        labels.set("my label", 3)
        labels.set("step-1", 4)

        expect(calcNextTime(5, "foo+0.2", 100, labels)).toBeCloseTo(2.2)
        expect(calcNextTime(5, "foo-0.4", 100, labels)).toBeCloseTo(1.6)
        expect(calcNextTime(5, "foo+1", 100, labels)).toBe(3)
        expect(calcNextTime(5, "foo-3", 100, labels)).toBe(0)
        expect(calcNextTime(5, "my label-1", 100, labels)).toBe(2)

        // Exact label names take precedence over offsets
        expect(calcNextTime(5, "step-1", 100, labels)).toBe(4)
        expect(calcNextTime(5, "step-1-1", 100, labels)).toBe(3)

        // Unknown labels resolve to the current time
        expect(calcNextTime(5, "bar+1", 100, labels)).toBe(6)
    })
})
