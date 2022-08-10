import { isWillChangeMotionValue } from "../is"
import { WillChangeMotionValue } from "../index"
import { MotionValue } from "../.."

describe("isWillChangeMotionValue", () => {
    test("Correctly detects WillChangeMotionValue", () => {
        expect(isWillChangeMotionValue(new WillChangeMotionValue("auto"))).toBe(
            true
        )
        expect(isWillChangeMotionValue(1)).toBe(false)
        expect(isWillChangeMotionValue(undefined)).toBe(false)
        expect(isWillChangeMotionValue(new MotionValue(0))).toBe(false)
    })
})
