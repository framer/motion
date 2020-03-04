//import { syncTree, flushTree } from "../tree-sync"

// TODO: Rewrite tests with syncTree(id, depth, callback) signature
describe("layoutSync", () => {
    test.skip("correctly schedules jobs", () => {
        // const syncId = "test"
        // const callOrder: number[] = []
        // syncTree(syncId, schedule => {
        //     schedule(() => callOrder.push(0))
        //     schedule(() => callOrder.push(1))
        //     schedule(() => callOrder.push(2))
        // })
        // const unsubscribe = syncTree(syncId, schedule => {
        //     schedule(() => callOrder.push(0))
        //     schedule(() => callOrder.push(1))
        //     schedule(() => callOrder.push(2))
        // })
        // syncTree(syncId, schedule => {
        //     schedule(() => callOrder.push(0))
        //     schedule(() => callOrder.push(1))
        //     schedule(() => callOrder.push(2))
        // })
        // unsubscribe()
        // flushTree(syncId)
        // expect(callOrder).toEqual([0, 0, 1, 1, 2, 2])
    })
})
