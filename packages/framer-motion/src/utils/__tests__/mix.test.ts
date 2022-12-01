import { mix } from "../mix"

test("mix", () => {
    expect(mix(0, 1, 0.5)).toBe(0.5)
    expect(mix(-100, 100, 2)).toBe(300)
    expect(mix(10, 20, 0.5)).toBe(15)
    expect(mix(-10, -20, 0.5)).toBe(-15)
    expect(mix(0, 80, 0.5)).toBe(40)
    expect(mix(100, 200, 2)).toBe(300)
    expect(mix(-100, 100, 2)).toBe(300)
})
