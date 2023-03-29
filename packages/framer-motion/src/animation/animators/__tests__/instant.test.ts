import { createInstantAnimation } from "../instant"

describe("instantAnimation", () => {
    test("Is instant, await", async () => {
        const onUpdate = jest.fn()
        const onComplete = jest.fn()

        await createInstantAnimation({
            keyframes: [0, 1],
            onUpdate,
            onComplete,
        })

        expect(onUpdate).toBeCalledWith(1)
        expect(onComplete).toBeCalled()
    })

    test("Is instant, .then()", async () => {
        const onUpdate = jest.fn()
        const onComplete = jest.fn()

        const animation = createInstantAnimation({
            keyframes: [0, 1],
            onUpdate,
            onComplete,
        })

        await new Promise<void>((resolve) => {
            animation.then(() => {}).then(() => resolve())
        })

        expect(onUpdate).toBeCalledWith(1)
        expect(onComplete).toBeCalled()
    })

    test("Can delay, await", async () => {
        const onUpdate = jest.fn()
        const onComplete = jest.fn()

        const animation = createInstantAnimation({
            delay: 0.1,
            keyframes: [0, 1],
            onUpdate,
            onComplete,
        })

        expect(onUpdate).not.toBeCalledWith(1)
        expect(onComplete).not.toBeCalled()

        await animation

        expect(onUpdate).toBeCalledWith(1)
        expect(onComplete).toBeCalled()
    })

    test("Can delay, .then()", async () => {
        const onUpdate = jest.fn()
        const onComplete = jest.fn()

        const animation = createInstantAnimation({
            delay: 0.1,
            keyframes: [0, 1],
            onUpdate,
            onComplete,
        })

        await new Promise<void>((resolve) => {
            animation.then(() => {}).then(() => resolve())

            expect(onUpdate).not.toBeCalledWith(1)
            expect(onComplete).not.toBeCalled()
        })

        expect(onUpdate).toBeCalledWith(1)
        expect(onComplete).toBeCalled()
    })

    test("Returns duration: 0", async () => {
        const animation = createInstantAnimation({
            delay: 0,
            keyframes: [0, 1],
        })
        expect(animation.duration).toEqual(0)

        const animationWithDelay = createInstantAnimation({
            delay: 0.2,
            keyframes: [0, 1],
        })
        expect(animationWithDelay.duration).toEqual(0)
    })
})
