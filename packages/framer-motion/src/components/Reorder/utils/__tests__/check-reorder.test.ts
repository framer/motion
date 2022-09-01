import { checkReorder } from "../check-reorder"

describe("checkReorder", () => {
    describe("one dimension", () => {
        const order = [
            {
                value: "a",
                layout: { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
            },
            {
                value: "b",
                layout: { x: { min: 110, max: 120 }, y: { min: 0, max: 100 } },
            },
            {
                value: "c",
                layout: { x: { min: 130, max: 230 }, y: { min: 0, max: 100 } },
            },
        ]

        test("Return same array if velocity is 0", () => {
            const newOrder = checkReorder(
                order,
                "a",
                { x: 116, y: 0 },
                { x: 0, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).toEqual(order)
        })

        test("Return same array if value not found", () => {
            const newOrder = checkReorder(
                order,
                "d",
                { x: 116, y: 0 },
                { x: 0, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).toEqual(order)
        })

        test("Return same array if nextItem not found", () => {
            const newOrder = checkReorder(
                order,
                "c",
                { x: 300, y: 0 },
                { x: 1, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).toEqual(order)
        })

        test("Return same array if item hasn't moved", () => {
            const newOrder = checkReorder(
                order,
                "a",
                { x: 14, y: 0 },
                { x: 2, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).toEqual(order)
        })

        test("Return reordered array if item has moved right", () => {
            const newOrder = checkReorder(
                order,
                "a",
                { x: 16, y: 0 },
                { x: 1.5, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).not.toEqual(order)
            expect(newOrder[0].value).toBe("b")
            expect(newOrder[1].value).toBe("a")
        })

        test("Return reordered array if item has moved down", () => {
            const newOrder = checkReorder(
                order,
                "a",
                { x: 0, y: 15 },
                { x: 0, y: 1 },
                "y",
                false,
                order.length
            )
            expect(newOrder).not.toEqual(order)
            expect(newOrder[0].value).toBe("b")
            expect(newOrder[1].value).toBe("a")
        })

        test("Return reordered array if item has moved left", () => {
            const newOrder = checkReorder(
                order,
                "b",
                { x: -61, y: 0 },
                { x: -2, y: 0 },
                "x",
                false,
                order.length
            )
            expect(newOrder).not.toEqual(order)
            expect(newOrder[0].value).toBe("b")
            expect(newOrder[1].value).toBe("a")
        })

        test("Return reordered array if item has moved up", () => {
            const newOrder = checkReorder(
                order,
                "b",
                { x: 0, y: -61 },
                { x: 0, y: -1 },
                "y",
                false,
                order.length
            )
            expect(newOrder).not.toEqual(order)
            expect(newOrder[0].value).toBe("b")
            expect(newOrder[1].value).toBe("a")
        })
    })
    describe("two dimensions", () => {})
    // order grid:
    // a b c
    // d e
    const order = [
        {
            value: "a",
            layout: { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
        },
        {
            value: "b",
            layout: { x: { min: 110, max: 120 }, y: { min: 0, max: 100 } },
        },
        {
            value: "c",
            layout: { x: { min: 130, max: 230 }, y: { min: 0, max: 100 } },
        },
        {
            value: "d",
            layout: { x: { min: 0, max: 100 }, y: { min: 110, max: 120 } },
        },
        {
            value: "e",
            layout: { x: { min: 110, max: 120 }, y: { min: 110, max: 120 } },
        },
    ]
    test("Return reordered array if item has moved in moved left", () => {
        const newOrder = checkReorder(
            order,
            "e",
            { x: -61, y: 0 },
            { x: -1, y: 0 },
            "x",
            true,
            3
        )
        expect(newOrder).not.toEqual(order)
        expect(newOrder[3].value).toBe("e")
        expect(newOrder[4].value).toBe("d")
    })
    test("Return reordered array if item has moved in moved right", () => {
        const newOrder = checkReorder(
            order,
            "a",
            { x: 63, y: 0 },
            { x: 1, y: 0 },
            "x",
            true,
            3
        )
        expect(newOrder).not.toEqual(order)
        expect(newOrder[1].value).toBe("a")
        expect(newOrder[0].value).toBe("b")
    })
    test("Return same array if first item of axis is moved left", () => {
        const newOrder = checkReorder(
            order,
            "a",
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            "x",
            true,
            3
        )
        expect(newOrder).toEqual(order)
    })
    test("Return same array if last item of axis is moved right", () => {
        const newOrder = checkReorder(
            order,
            "c",
            { x: 1, y: 0 },
            { x: 5, y: 0 },
            "x",
            true,
            3
        )
        expect(newOrder).toEqual(order)
    })
    test("Return reordered array if item has moved in moved up", () => {
        const newOrder = checkReorder(
            order,
            "e",
            { x: 0, y: -61 },
            { x: 0, y: -1 },
            "x",
            true,
            3
        )
        expect(newOrder).not.toEqual(order)
        expect(newOrder.map((i) => i.value)).toEqual(["a", "e", "b", "c", "d"])
    })
    test("Return reordered array if item has moved in moved down", () => {
        const newOrder = checkReorder(
            order,
            "a",
            { x: 0, y: 62 },
            { x: 0, y: 1 },
            "x",
            true,
            3
        )

        expect(newOrder).not.toEqual(order)
        expect(newOrder.map((i) => i.value)).toEqual(["b", "c", "d", "a", "e"])
    })
    test("Return same array if item is moved up from first row", () => {
        const newOrder = checkReorder(
            order,
            "a",
            { x: 0, y: -61 },
            { x: 0, y: -1 },
            "x",
            true,
            3
        )
        expect(newOrder).toEqual(order)
    })
    test("Return same array if item is moved down from last column", () => {
        const newOrder = checkReorder(
            order,
            "e",
            { x: 0, y: 62 },
            { x: 0, y: 1 },
            "x",
            true,
            3
        )

        expect(newOrder).toEqual(order)
    })
})
