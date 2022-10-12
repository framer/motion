import { calcNextTime } from "../calc-next-time"

describe("calcNextTime", () => {
    test("Correctly calculates next time", () => {
        const labels = new Map<string, number>()
        labels.set("test", 100)

        expect(calcNextTime(0, 0, labels)).toEqual(0)
        expect(calcNextTime(100, 0, labels)).toEqual(100)
        expect(calcNextTime(50, 25, labels)).toEqual(50)
        expect(calcNextTime(50, 25, labels, "test")).toEqual(100)
        expect(calcNextTime(50, 25, labels, "foo")).toEqual(50)
        expect(calcNextTime(50, 25, labels, 500)).toEqual(500)
        expect(calcNextTime(50, 25, labels, "+10")).toEqual(60)
        expect(calcNextTime(50, 25, labels, "-10")).toEqual(40)
        expect(calcNextTime(50, 25, labels, "<")).toEqual(25)
        expect(calcNextTime(50, 25, labels, "<+10")).toEqual(35)
        expect(calcNextTime(50, 25, labels, "<-10")).toEqual(15)
    })
})
