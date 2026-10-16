import { hasTransform } from "../has-transform"

describe("hasTransform", () => {
    it("Detects rotations on every axis", () => {
        expect(hasTransform({})).toBeFalsy()
        expect(hasTransform({ rotate: 45 })).toBeTruthy()
        expect(hasTransform({ rotateX: 45 })).toBeTruthy()
        expect(hasTransform({ rotateY: 45 })).toBeTruthy()
        expect(hasTransform({ rotateZ: 45 })).toBeTruthy()
    })
})
