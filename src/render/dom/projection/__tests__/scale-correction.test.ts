import { createLayoutState, createProjectionState } from "../../../utils/state"
import {
    pixelsToPercent,
    correctBoxShadow,
    correctBorderRadius,
} from "../default-scale-correctors"

describe("pixelsToPercent", () => {
    test("Correctly converts pixels to percent", () => {
        expect(pixelsToPercent(10, { min: 300, max: 500 })).toEqual(5)
    })
})

describe("correctBoxShadow", () => {
    test("Correctly scales box shadow", () => {
        const layoutState = createLayoutState()
        layoutState.delta = {
            x: { scale: 0.5, translate: 0, origin: 0, originPoint: 0 },
            y: { scale: 0.5, translate: 0, origin: 0, originPoint: 0 },
        }
        layoutState.treeScale = {
            x: 1,
            y: 1,
        }
        expect(correctBoxShadow("5px 10px 20px 40px #000", layoutState)).toBe(
            "10px 20px 40px 80px rgba(0, 0, 0, 1)"
        )

        layoutState.treeScale = {
            x: 0.5,
            y: 0.5,
        }
        expect(correctBoxShadow("10px 10px 10px 10px #000", layoutState)).toBe(
            "40px 40px 40px 40px rgba(0, 0, 0, 1)"
        )

        layoutState.treeScale = {
            x: 1,
            y: 1,
        }
        expect(
            correctBoxShadow(
                "10px 10px 10px 10px var(--token-c8953278-7b3-4177-a0fa-f3cda39afd50, rgba(0, 0, 0, 1))",
                layoutState
            )
        ).toBe(
            "20px 20px 20px 20px var(--token-c8953278-7b3-4177-a0fa-f3cda39afd50, rgba(0, 0, 0, 1))"
        )

        // TODO: Only supports a single shadow
        expect(
            correctBoxShadow(
                "10px 10px 10px 10px rgba(0, 0, 0, 1), 0px 0px 0px 4px var(--token-c8953278-7b3-4177-a0fa-f3cda39afd50, #333)",
                layoutState
            )
        ).toBe(
            "10px 10px 10px 10px rgba(0, 0, 0, 1), 0px 0px 0px 4px var(--token-c8953278-7b3-4177-a0fa-f3cda39afd50, #333)"
        )
    })
})

describe("correctBorderRadius", () => {
    test("Leaves non-pixel values alone", () => {
        const projection = createProjectionState()
        projection.target = {
            x: { min: 0, max: 0 },
            y: { min: 0, max: 0 },
        }
        expect(
            correctBorderRadius("20%", createLayoutState(), projection)
        ).toBe("20%")
    })

    test("Correctly scales pixel values by converting them to percentage of the viewport box", () => {
        const projection = createProjectionState()
        projection.target = {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 200 },
        }
        expect(correctBorderRadius(20, createLayoutState(), projection)).toBe(
            "20% 10%"
        )
    })
})
