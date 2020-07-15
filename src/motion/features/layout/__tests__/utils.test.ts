import { tweenAxis } from "../utils"

describe("tweenAxis", () => {
    test("tweenAxis", () => {
        const target = { min: 0, max: 0 }
        tweenAxis(target, { min: 0, max: 100 }, { min: 300, max: 700 }, 0.5)
        expect(target).toEqual({ min: 150, max: 400 })
    })
})
