import { mixArray } from "../complex"

test("mixArray", () => {
    const a = [0, "100px 0px", "#fff"]
    const b = [50, "200px 100px", "#000"]

    const blender = mixArray(a, b)

    expect(blender(0)).toEqual([0, "100px 0px", "#fff"])
    expect(blender(1)).toEqual([50, "200px 100px", "#000"])
    expect(blender(0.5)).toEqual([25, "150px 50px", "rgba(180, 180, 180, 1)"])
})
