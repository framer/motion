import "../../../jest.setup"
import { Point } from "../types"

describe("pointRelativeTo", () => {
    it("should return nothing if there is no element available", () => {
        const convert = Point.pointRelativeTo(null)
        expect(convert({ x: 1, y: 1 })).toBeUndefined()
    })
    it("should use provided element", () => {
        const elem = {
            getBoundingClientRect() {
                return { left: 10, top: 5 }
            },
        }
        const convert = Point.pointRelativeTo(elem as HTMLElement)
        expect(convert({ x: 12, y: 12 })).toEqual({ x: 2, y: 7 })
    })
    it("should use element from document if id was provided", () => {
        const elem = {
            getBoundingClientRect() {
                return { left: 10, top: 6 }
            },
        }

        const getElementById = document.getElementById
        document.getElementById = () => elem as HTMLElement
        const convert = Point.pointRelativeTo("test")
        expect(convert({ x: 12, y: 12 })).toEqual({ x: 2, y: 6 })
        document.getElementById = getElementById
    })
})
