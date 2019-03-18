import "../../../jest.setup"
import { Point } from "../types"

describe("relativeTo", () => {
    it("should return nothing if there is no element available", () => {
        const convert = Point.relativeTo(null)
        expect(convert({ x: 1, y: 1 })).toBeUndefined()
    })
    it("should use provided element", () => {
        const elem = {
            getBoundingClientRect() {
                return { left: 10, top: 5 }
            },
        }
        const convert = Point.relativeTo(elem as HTMLElement)
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
        const convert = Point.relativeTo("test")
        expect(convert({ x: 12, y: 12 })).toEqual({ x: 2, y: 6 })
        document.getElementById = getElementById
    })
})
