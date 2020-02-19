import { sync, flush } from "../layout-sync"

describe("layoutSync", () => {
    test("correctly schedules jobs read -> write", () => {
        let syncId = "test"
        const callOrder: number[] = []

        sync(syncId, (read, write) => {
            read(() => callOrder.push(0))
            write(() => callOrder.push(1))
            read(() => callOrder.push(2))
            write(() => callOrder.push(3))
        })

        sync(syncId, (read, write) => {
            read(() => callOrder.push(4))
            write(() => callOrder.push(5))
            read(() => callOrder.push(6))
            write(() => callOrder.push(7))
        })

        flush(syncId)

        expect(callOrder).toEqual([0, 4, 1, 5, 2, 6, 3, 7])
    })

    test("clears job list", () => {
        let syncId = "test"
        let callOrder: number[] = []

        sync(syncId, read => {
            read(() => callOrder.push(0))
        })

        sync(syncId, read => {
            read(() => callOrder.push(4))
        })

        flush(syncId)

        callOrder = []

        sync(syncId, (read, write) => {
            read(() => callOrder.push(0))
            write(() => callOrder.push(1))
            read(() => callOrder.push(2))
            write(() => callOrder.push(3))
        })

        sync(syncId, (read, write) => {
            read(() => callOrder.push(4))
            write(() => callOrder.push(5))
            read(() => callOrder.push(6))
            write(() => callOrder.push(7))
        })

        flush(syncId)

        expect(callOrder).toEqual([0, 4, 1, 5, 2, 6, 3, 7])
    })

    test("throws if write is called first", () => {
        expect(() => {
            let syncId = "test"
            const callOrder: number[] = []

            sync(syncId, (_read, write) => {
                write(() => callOrder.push(0))
            })

            flush(syncId)
        }).toThrow()
    })

    test("throws if jobs called out-of-order", () => {
        expect(() => {
            let syncId = "test"
            const callOrder: number[] = []

            sync(syncId, read => {
                read(() => callOrder.push(0))
                read(() => callOrder.push(0))
            })

            flush(syncId)
        }).toThrow()
    })
})
