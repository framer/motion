import { tweenAxis, checkIfParentHasChanged } from "../utils"

describe("tweenAxis", () => {
    test("tweenAxis", () => {
        const target = { min: 0, max: 0 }
        tweenAxis(target, { min: 0, max: 100 }, { min: 300, max: 700 }, 0.5)
        expect(target).toEqual({ min: 150, max: 400 })
    })
})

describe("checkIfParentHasChanged", () => {
    test("checks whether arguments are conceptually the same", () => {
        const a = {
            getLayoutId: () => "a",
        }

        const b = {
            getLayoutId: () => "b",
        }

        const a2 = { ...a }

        expect(checkIfParentHasChanged(a, a2)).toBe(false)
        expect(checkIfParentHasChanged(a, a)).toBe(false)
        expect(checkIfParentHasChanged(a, b)).toBe(true)
    })
})
