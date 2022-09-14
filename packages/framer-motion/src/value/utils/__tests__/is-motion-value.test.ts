import { motionValue } from "../.."
import { isMotionValue } from "../is-motion-value"

describe("isMotionValue", () => {
    test("correctly detects motion values", () => {
        expect(isMotionValue(motionValue(0))).toBeTrue()
        expect(isMotionValue(undefined)).toBeFalse()
        expect(isMotionValue("a")).toBeFalse()
        expect(isMotionValue(null)).toBeFalse()
        expect(isMotionValue(0)).toBeFalse()
    })
})
