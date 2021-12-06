import { motionValue } from "../../../../value"
import { scrapeMotionValuesFromProps } from "../scrape-motion-value"

describe("scrapeMotionValuesFromProps", () => {
    test("Scrapes motion values from props", () => {
        const x = motionValue(0)
        const z = motionValue(0)
        const scale = motionValue(0)
        const scaleZ = motionValue(0)
        const rotateX = motionValue(0)
        const rotateZ = motionValue(0)
        const color = motionValue("#fff")

        expect(
            scrapeMotionValuesFromProps({
                "position-x": x,
                scale,
                "position-y": 100,
                "scale-z": scaleZ,
                position: [0, 0, z],
                rotation: [rotateX, 0, rotateZ],
                color,
            } as any)
        ).toEqual({
            x,
            z,
            scale,
            scaleZ,
            rotateX,
            rotateZ,
            color,
        })
    })
})
