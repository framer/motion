import { buildStyleAttr } from "../use-styles"
import { MotionValuesMap } from "../use-motion-values"
import { motionValue } from "../../../value"

test("buildStyleAttr returns React-compatible styles", () => {
    const values = new MotionValuesMap()
    values.set("x", motionValue(10))
    values.set("y", motionValue(20))
    values.set("originZ", motionValue(10))
    const style = buildStyleAttr(values, {})

    expect(style).toEqual({
        transform: "translateX(10px) translateY(20px) translateZ(0)",
        transformOrigin: "50% 50% 10px",
    })
})
