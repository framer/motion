import { subscriptionManager } from "../subscription-manager"

describe("subscriptionManager", () => {
    test("Adds a subscription", () => {
        const manager = subscriptionManager()
        const callback = jest.fn()
        manager.add(callback)
        manager.notify(2)
        expect(callback).toBeCalledTimes(1)
        expect(callback).toBeCalledWith(2, undefined, undefined)
    })

    test("Removes a subscription", () => {
        const manager = subscriptionManager()
        const callback = jest.fn()
        const remove = manager.add(callback)
        remove()
        manager.notify(2)
        expect(callback).toBeCalledTimes(0)
    })

    test("Clears all subscription", () => {
        const manager = subscriptionManager()
        const callback = jest.fn()
        manager.add(callback)
        manager.clear()
        manager.notify(2)
        expect(callback).toBeCalledTimes(0)
    })
})
