import { resolveMotionValue } from "../utils/resolve-motion-value"
import { MotionValue } from "../"

class Test {
    mix() {
        return () => 0
    }
    toValue() {
        return 5
    }
}

describe("resolveMotionValue", () => {
    it("should leave non-motion values alone", () => {
        let value: any = { test: "foo" }
        expect(resolveMotionValue(value)).toBe(value)
        value = 4
        expect(resolveMotionValue(value)).toBe(4)
    })
    it("should should unwrap a motion value", () => {
        let motionValue: MotionValue<any> = new MotionValue(3)
        expect(resolveMotionValue(motionValue)).toBe(3)
        const value = { test: "bar" }
        motionValue = new MotionValue(value)
        expect(resolveMotionValue(motionValue)).toBe(value)
    })
    it("should should unwrap a custom value", () => {
        expect(resolveMotionValue(new Test())).toEqual(5)
    })
})
