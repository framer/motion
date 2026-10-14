import { easingDefinitionToFunction } from "motion-utils"
import { getOriginIndex, stagger } from "../stagger"

describe("stagger", () => {
    test("Creates a stagger function", () => {
        expect(stagger(0.1)(0, 10)).toEqual(0)
        expect(stagger(0.1)(2, 10)).toEqual(0.2)
    })

    test("Accepts startDelay", () => {
        expect(stagger(0.1, { startDelay: 0.2 })(0, 10)).toEqual(0.2)
        expect(stagger(0.1, { startDelay: 0.2 })(2, 10)).toEqual(0.4)
    })

    test("Accepts from", () => {
        expect(stagger(0.1, { from: 2 })(0, 10)).toEqual(0.2)
        expect(stagger(0.1, { from: "first" })(2, 10)).toEqual(0.2)
        expect(stagger(0.1, { from: "last" })(9, 10)).toEqual(0)
        expect(stagger(0.1, { from: "last" })(5, 10)).toEqual(0.4)
        expect(stagger(0.1, { from: "center" })(2, 10)).toEqual(0.25)
    })

    test("Accepts easing", () => {
        expect(stagger(0.1, { ease: "linear" })(5, 10)).toEqual(0.5)

        const expectedEaseIn = easingDefinitionToFunction("easeIn")(0.5)
        expect(stagger(0.1, { ease: "easeIn" })(5, 10)).toEqual(expectedEaseIn)

        const expectedEaseOut = easingDefinitionToFunction("easeOut")(0.5)
        expect(stagger(0.1, { ease: "easeOut" })(5, 10)).toEqual(
            expectedEaseOut
        )

        expect(stagger(0.1, { ease: (v: number) => v / 2 })(4, 10)).toEqual(0.2)
    })
})

describe("stagger with from outside the element range", () => {
    test("Keeps measuring along one line", () => {
        expect(stagger(0.1, { from: 15 })(0, 10)).toEqual(1.5)
        expect(stagger(0.1, { from: 2 })(0, 2)).toEqual(0.2)
        expect(stagger(0.1, { from: -2 })(0, 5)).toEqual(0.2)
    })
})

describe("stagger from edges", () => {
    test("Starts at both ends and works inward", () => {
        const delay = stagger(0.1, { from: "edges" })
        expect([0, 1, 2, 3, 4].map((i) => delay(i, 5))).toEqual([
            0, 0.1, 0.2, 0.1, 0,
        ])
        expect([0, 1, 2, 3].map((i) => delay(i, 4))).toEqual([0, 0.1, 0.1, 0])
    })

    test("Accepts startDelay", () => {
        expect(stagger(0.1, { from: "edges", startDelay: 1 })(4, 5)).toEqual(1)
    })
})

describe("stagger from random", () => {
    test("Gives each element a distinct step", () => {
        const delay = stagger(0.1, { from: "random" })
        const delays = Array.from({ length: 20 }, (_, i) =>
            Math.round(delay(i, 20) * 10)
        )
        expect([...delays].sort((a, b) => a - b)).toEqual(
            Array.from({ length: 20 }, (_, i) => i)
        )
    })

    test("Returns a stable delay for the same element", () => {
        const delay = stagger(0.1, { from: "random" })
        const first = Array.from({ length: 10 }, (_, i) => delay(i, 10))
        const second = Array.from({ length: 10 }, (_, i) => delay(i, 10))
        expect(second).toEqual(first)
    })

    test("Keeps each element count's order when counts interleave", () => {
        const delay = stagger(0.1, { from: "random" })
        const six: number[] = []
        for (let i = 0; i < 6; i++) {
            six.push(Math.round(delay(i, 6) * 10))
            delay(i % 4, 4)
        }
        expect(six.sort()).toEqual([0, 1, 2, 3, 4, 5])
        expect(delay(2, 6)).toEqual(delay(2, 6))
    })

    test("Uses a new order when the number of elements changes", () => {
        const delay = stagger(0.1, { from: "random" })
        delay(0, 10)
        const delays = Array.from({ length: 4 }, (_, i) =>
            Math.round(delay(i, 4) * 10)
        )
        expect(delays.sort()).toEqual([0, 1, 2, 3])
    })
})

describe("stagger grid", () => {
    const round = (v: number) => Math.round(v * 1000) / 1000

    test("Uses the 2D distance from the first cell by default", () => {
        const delay = stagger(0.1, { grid: [3, 2] })
        // Row 0: cells 0, 1, 2. Row 1: cells 3, 4, 5.
        expect([0, 1, 2, 3, 4, 5].map((i) => round(delay(i, 6)))).toEqual([
            0,
            0.1,
            0.2,
            0.1,
            round(0.1 * Math.SQRT2),
            round(0.1 * Math.sqrt(5)),
        ])
    })

    test("Accepts from: center", () => {
        const delay = stagger(0.1, { grid: [3, 3], from: "center" })
        expect(delay(4, 9)).toEqual(0)
        expect(round(delay(1, 9))).toEqual(0.1)
        expect(round(delay(0, 9))).toEqual(round(0.1 * Math.SQRT2))
    })

    test("Accepts from: last", () => {
        const delay = stagger(0.1, { grid: [3, 3], from: "last" })
        expect(delay(8, 9)).toEqual(0)
        expect(round(delay(0, 9))).toEqual(round(0.2 * Math.SQRT2))
    })

    test("Accepts an index as from", () => {
        const delay = stagger(0.1, { grid: [3, 3], from: 2 })
        expect(delay(2, 9)).toEqual(0)
        expect(round(delay(0, 9))).toEqual(0.2)
        expect(round(delay(8, 9))).toEqual(0.2)
    })

    test("Accepts from: edges", () => {
        const delay = stagger(0.1, { grid: [5, 5], from: "edges" })
        expect(delay(0, 25)).toEqual(0)
        expect(delay(2, 25)).toEqual(0)
        expect(round(delay(6, 25))).toEqual(0.1)
        expect(round(delay(12, 25))).toEqual(0.2)
    })

    test("Works inward along a single column with from: edges", () => {
        const delay = stagger(0.1, { grid: [1, 5], from: "edges" })
        expect([0, 1, 2, 3, 4].map((i) => round(delay(i, 5)))).toEqual([
            0, 0.1, 0.2, 0.1, 0,
        ])
    })

    test("Adds rows when there are more elements than cells", () => {
        const delay = stagger(0.1, { grid: [2, 2], from: "edges" })
        const delays = Array.from({ length: 6 }, (_, i) => delay(i, 6))
        expect(Math.min(...delays)).toEqual(0)
        expect(round(delay(2, 6))).toEqual(0)

        const fromLast = stagger(0.1, { grid: [3, 3], from: "last" })
        expect(fromLast(11, 12)).toEqual(0)
    })

    test("Accepts from: random", () => {
        const delay = stagger(0.1, { grid: [3, 3], from: "random" })
        const delays = Array.from({ length: 9 }, (_, i) =>
            Math.round(delay(i, 9) * 10)
        )
        expect(delays.sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })

    test("Eases across the farthest cell", () => {
        const delay = stagger(0.1, {
            grid: [3, 3],
            from: "center",
            ease: (v: number) => v * v,
        })
        const max = 0.1 * Math.SQRT2
        expect(round(delay(0, 9))).toEqual(round(max))
        expect(round(delay(1, 9))).toEqual(round((0.1 / max) ** 2 * max))
    })
})

describe("getOriginIndex", () => {
    test("Returns correct index", () => {
        expect(getOriginIndex("first", 9)).toEqual(0)
        expect(getOriginIndex("last", 9)).toEqual(8)
        expect(getOriginIndex("center", 9)).toEqual(4)
        expect(getOriginIndex("center", 10)).toEqual(4.5)
    })
})

describe("stagger grid: auto", () => {
    const round = (v: number) => Math.round(v * 1000) / 1000

    /**
     * Fake elements with a layout position. Counts every layout read.
     */
    function layout(positions: Array<[number, number]>) {
        const reads = { count: 0 }
        const elements = positions.map(([left, top]) => ({
            get offsetLeft() {
                reads.count++
                return left
            },
            get offsetTop() {
                reads.count++
                return top
            },
        }))
        return { elements, reads }
    }

    // A 3 x 2 grid, 100px cells
    const cells: Array<[number, number]> = [
        [0, 0],
        [100, 0],
        [200, 0],
        [0, 100],
        [100, 100],
        [200, 100],
    ]

    test("Reads columns and rows from layout", () => {
        const { elements } = layout(cells)
        const auto = stagger(0.1, { grid: "auto", from: "center" })
        const fixed = stagger(0.1, { grid: [3, 2], from: "center" })

        for (let i = 0; i < 6; i++) {
            expect(round(auto(i, 6, elements))).toEqual(round(fixed(i, 6)))
        }
    })

    test("Measures all elements once, on the first call", () => {
        const { elements, reads } = layout(cells)
        const delay = stagger(0.1, { grid: "auto" })

        delay(0, 6, elements)
        const readsAfterFirstCall = reads.count
        expect(readsAfterFirstCall).toEqual(12)

        // Later calls with an equal (but new) array hit the cache
        for (let i = 1; i < 6; i++) delay(i, 6, [...elements])
        expect(reads.count).toEqual(readsAfterFirstCall)
    })

    test("Measures again for different elements", () => {
        const a = layout(cells)
        const b = layout(cells)
        const delay = stagger(0.1, { grid: "auto" })

        delay(0, 6, a.elements)
        delay(0, 6, b.elements)
        expect(b.reads.count).toEqual(12)
    })

    test("Keeps centred items of mixed height in one row", () => {
        const { elements } = layout([
            [0, 10],
            [100, 0],
            [200, 20],
            [0, 100],
            [100, 100],
            [200, 100],
        ])
        const delay = stagger(0.1, { grid: "auto" })

        expect(round(delay(2, 6, elements))).toEqual(0.2)
        expect(round(delay(3, 6, elements))).toEqual(0.1)
    })

    test("Handles rows of different lengths", () => {
        const { elements } = layout([
            [0, 0],
            [100, 0],
            [200, 0],
            [0, 100],
        ])
        const delay = stagger(0.1, { grid: "auto", from: "last" })

        expect(delay(3, 4, elements)).toEqual(0)
        expect(round(delay(0, 4, elements))).toEqual(0.1)
    })

    test("Falls back to a single line without elements", () => {
        const delay = stagger(0.1, { grid: "auto" })
        expect(round(delay(3, 6))).toEqual(0.3)
    })
})
