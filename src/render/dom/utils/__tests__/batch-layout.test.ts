import { batchLayout, flushLayout } from "../batch-layout"

describe("batchLayout", () => {
    test("Executes scheduled jobs in the correct order", () => {
        const order: number[] = []

        batchLayout((read, write) => {
            read(() => order.push(1))
            write(() => order.push(2))
            read(() => order.push(3))
            write(() => order.push(4))
        })

        batchLayout((read, write) => {
            write(() => order.push(5))
            read(() => order.push(6))
            write(() => order.push(7))
        })

        flushLayout()

        expect(order).toEqual([1, 2, 5, 3, 6, 4, 7])

        // Ensure jobs are properly flushed
        flushLayout()
        expect(order).toEqual([1, 2, 5, 3, 6, 4, 7])
    })

    test("Returns a cancel function that will cancel a job", () => {
        const order: number[] = []
        batchLayout((read, write) => {
            read(() => order.push(1))
            write(() => order.push(2))
            read(() => order.push(3))
            write(() => order.push(4))
        })
        const cancel = batchLayout((read, write) => {
            write(() => order.push(5))
            read(() => order.push(6))
            write(() => order.push(7))
        })
        cancel()
        flushLayout()
        expect(order).toEqual([1, 2, 3, 4])
    })
})
