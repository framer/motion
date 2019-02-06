import { unwrapMotionValue } from "../utils/unwrap-value"
import { MotionValue } from "../"

describe("unwrapMotionValue", () => {
    it("should leave non-motion values alone", () => {
        let value: any = { test: "foo" }
        expect(unwrapMotionValue(value)).toBe(value)
        value = 4
        expect(unwrapMotionValue(value)).toBe(4)
    })
    it("should should unwrap a motion value", () => {
        let motionValue: MotionValue<any> = new MotionValue(3)
        expect(unwrapMotionValue(motionValue)).toBe(3)
        const value = { test: "bar" }
        motionValue = new MotionValue(value)
        expect(unwrapMotionValue(motionValue)).toBe(value)
    })
})
