import { radiusAsPixels } from "../values"
import { AxisBox2D } from "../../../../types/geometry"

describe("radiusAsPixels", () => {
    const box: AxisBox2D = {
        x: { min: 100, max: 200 },
        y: { min: 100, max: 300 },
    }

    test("Should correctly parse single axis pixels", () => {
        expect(radiusAsPixels("20px", box)).toEqual({ x: 20, y: 20 })
    })
    test("Should correctly parse dual axis pixels", () => {
        expect(radiusAsPixels("30px 100px", box)).toEqual({ x: 30, y: 100 })
    })
    test("Should correctly parse single axis percentage", () => {
        expect(radiusAsPixels("50%", box)).toEqual({ x: 50, y: 100 })
    })
    test("Should correctly parse dual axis percentages", () => {
        expect(radiusAsPixels("10% 20%", box)).toEqual({ x: 10, y: 40 })
    })
    test("Should correctly parse mixed pixels and percentage", () => {
        expect(radiusAsPixels("40px 50%", box)).toEqual({ x: 40, y: 100 })
    })
})
