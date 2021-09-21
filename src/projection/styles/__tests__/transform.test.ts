import { buildProjectionTransform } from "../transform"
import { createDelta } from "../../geometry/models"

describe("buildProjectionTransform", () => {
    it("Creates the expected transform for the provided arguments", () => {
        expect(buildProjectionTransform(createDelta(), { x: 1, y: 1 })).toEqual(
            "none"
        )

        const delta = {
            x: {
                translate: 100,
                scale: 2,
                origin: 0.5,
                originPoint: 100,
            },
            y: {
                translate: 300,
                scale: 4,
                origin: 0.5,
                originPoint: 100,
            },
        }
        expect(buildProjectionTransform(delta, { x: 1, y: 1 })).toEqual(
            "translate(100px, 300px) scale(2, 4)"
        )

        expect(buildProjectionTransform(delta, { x: 2, y: 0.5 })).toEqual(
            "translate(50px, 600px) scale(2, 4)"
        )
    })
})
