import { eachAxis } from "../each-axis"

describe("eachAxis", () => {
    test("Fires the callback once for each axis and returns an array with the results", () => {
        expect(eachAxis(axis => axis)).toEqual(["x", "y"])
    })
})
