import { mirrorEasing } from "../mirror"
import { easeIn, easeInOut } from "../../ease"

describe("mirrorEasing", () => {
    test("correctly mirrors an easing curve", () => {
        expect(mirrorEasing(easeIn)(0.25)).toEqual(easeInOut(0.25))
        expect(mirrorEasing(easeIn)(0.75)).toEqual(easeInOut(0.75))
    })
})
