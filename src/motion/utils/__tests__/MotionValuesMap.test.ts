import "../../../../jest.setup"
import { motionValue } from "../../../value"
import { MotionValuesMap } from "../use-motion-values"

test("MotionValuesMap doesn't duplicate listeners", () => {
    const map = new MotionValuesMap()
    map.mount()
    const a = motionValue(0)
    map.set("a", a)
    a.set(1)
    expect(a.updateSubscribers!.size).toBe(1)

    map.set("a", a)
    a.set(2)
    expect(a.updateSubscribers!.size).toBe(1)
})
