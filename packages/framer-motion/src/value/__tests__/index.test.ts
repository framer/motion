import { motionValue } from "../"
import { animate } from "../../animation/animate"
import { frame } from "../../frameloop"

describe("motionValue", () => {
    test("change event is type-inferred", () => {
        const value = motionValue(0)

        value.on("change", (latest) => latest / 2)
    })

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

    test("When all change listeners removed, stop animation", async () => {
        const value = motionValue(0)

        const unsubscribeA = value.on("change", (latest) => latest)
        const unsubscribeB = value.on("change", (latest) => latest)

        animate(value, 100)

        expect(value.isAnimating()).toEqual(true)

        return new Promise<void>((resolve) => {
            unsubscribeA()
            expect(value.isAnimating()).toEqual(true)
            unsubscribeB()

            frame.postRender(() => {
                expect(value.isAnimating()).toEqual(false)
                resolve()
            })
        })
    })
})
