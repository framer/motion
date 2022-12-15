import { motionValue } from "../"
import { animate } from "../../animation/animate"

describe("motionValue", () => {
    test("change event fires when value changes", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("change", callback)

        expect(callback).not.toBeCalled()
        value.set(1)
        expect(callback).toBeCalledTimes(1)
        value.set(1)
        expect(callback).toBeCalledTimes(1)
    })

    test("renderRequest event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("renderRequest", callback)

        expect(callback).not.toBeCalled()
        value.set(1)
        expect(callback).toBeCalledTimes(1)
    })

    test("animationStart event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationStart", callback)

        expect(callback).not.toBeCalled()

        animate(value, 2)

        expect(callback).toBeCalledTimes(1)
    })

    test("animationCancel event fires", () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationCancel", callback)

        expect(callback).not.toBeCalled()

        animate(value, 1)
        animate(value, 2)

        expect(callback).toBeCalledTimes(1)
    })

    test("animationComplete event fires", async () => {
        const value = motionValue(0)
        const callback = jest.fn()

        value.on("animationComplete", callback)

        expect(callback).not.toBeCalled()

        animate(value, 1, { duration: 0.01 })

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(callback).toBeCalledTimes(1)
                resolve()
            }, 100)
        })
    })
})
