import { motionValue } from "../../../../value"
import { scrapeMotionValuesFromProps } from "../scrape-motion-values"

describe("SVG scrapeMotionValuesFromProps", () => {
    test("correctly scrapes motion values from props", () => {
        const x = motionValue(0)
        const attrX = motionValue(0)
        const attrY = motionValue(0)

        expect(
            scrapeMotionValuesFromProps(
                {
                    x: attrX,
                    attrY,
                    prev: 0,
                    style: { x },
                } as any,
                {
                    prev: motionValue(1),
                } as any
            )
        ).toEqual({
            attrX,
            attrY,
            x,
            prev: 0,
        })
    })
})
