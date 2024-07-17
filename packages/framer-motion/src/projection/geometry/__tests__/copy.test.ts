import { copyBoxInto } from "../copy"
import { Box } from "../models"

describe("copyBoxInto", () => {
    it("copies one box into an existing box", () => {
        const a = new Box()
        const b = {
            x: { min: 1, max: 2 },
            y: { min: 3, max: 4 },
        }

        copyBoxInto(a, b)

        expect(a).toEqual(b)
        expect(a).not.toBe(b)
    })
})
