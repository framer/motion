import { resolvePoses } from "../pose-resolvers"

describe("poseToArray", () => {
    it("Should correctly convert single string to array with the default pose applied", () => {
        expect(resolvePoses("a")).toEqual(["default", "a"])
    })

    it("Should leave arrays as-is", () => {
        expect(resolvePoses(["a", "b"])).toEqual(["default", "a", "b"])
    })

    it("Should remove falsey poses", () => {
        expect(resolvePoses()).toEqual(["default"])
    })
})
