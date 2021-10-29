import { motionValue } from "../../../../value"
import { scrapeMotionValuesFromProps } from "../scrape-motion-values"

describe("SVG scrapeMotionValuesFromProps", () => {
    test("correctly scrapes motion values from props", () => {
        const x = motionValue(0)
        const attrX = motionValue(0)
        const attrY = motionValue(0)

        expect(
            scrapeMotionValuesFromProps({
                x: attrX,
                attrY,
                style: { x },
            } as any)
        ).toEqual({
            attrX,
            attrY,
            x,
        })
    })
})
