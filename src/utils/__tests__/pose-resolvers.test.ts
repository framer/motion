import { poseToArray } from "../pose-resolvers"

describe("poseToArray", () => {
    it("Should correctly convert single string to array with the default pose applied", () => {
        expect(poseToArray("a")).toEqual(["default", "a"])
    })

    it("Should leave arrays as-is", () => {
        expect(poseToArray(["a", "b"])).toEqual(["default", "a", "b"])
    })

    it("Should remove falsey poses", () => {
        expect(poseToArray()).toEqual(["default"])
    })
})
