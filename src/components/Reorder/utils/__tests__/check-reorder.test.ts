import { checkReorder } from "../check-reorder"

describe("checkReorder", () => {
    const order = [
        { value: "a", layout: { min: 0, max: 100 } },
        { value: "b", layout: { min: 110, max: 120 } },
        { value: "c", layout: { min: 130, max: 230 } },
    ]

    test("Return same array if velocity is 0", () => {
        const newOrder = checkReorder(order, "a", 116, 0)
        expect(newOrder).toEqual(order)
    })

    test("Return same array if value not found", () => {
        const newOrder = checkReorder(order, "d", 116, 0)
        expect(newOrder).toEqual(order)
    })

    test("Return same array if nextItem not found", () => {
        const newOrder = checkReorder(order, "c", 300, 1)
        expect(newOrder).toEqual(order)
    })

    test("Return same array if item hasn't moved", () => {
        const newOrder = checkReorder(order, "a", 14, 1)
        expect(newOrder).toEqual(order)
    })

    test("Return reordered array if item has moved right", () => {
        const newOrder = checkReorder(order, "a", 16, 1)
        expect(newOrder).not.toEqual(order)
        expect(newOrder[0].value).toBe("b")
        expect(newOrder[1].value).toBe("a")
    })

    test("Return reordered array if item has moved left", () => {
        const newOrder = checkReorder(order, "b", -61, -1)
        expect(newOrder).not.toEqual(order)
        expect(newOrder[0].value).toBe("b")
        expect(newOrder[1].value).toBe("a")
    })
})
