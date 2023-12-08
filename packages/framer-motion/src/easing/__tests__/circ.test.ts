import { circIn, circOut, circInOut } from "../circ"

describe("circ easing", () => {
    test("circInOut is correct", () => {
        expect(circInOut(0.25)).toBe(circIn(0.5))
        expect(circInOut(0.75)).toBe(circOut(0.5))
    })
})
