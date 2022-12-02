import sync, { cancelSync, flushSync } from ".."
import { onNextFrame } from "../on-next-frame"

describe("onNextFrame", () => {
    it("fires callback on following frame", () => {
        return new Promise((resolve) => onNextFrame(resolve))
    })
})

describe("sync", () => {
    it("fires callbacks in the correct order", () => {
        return new Promise<void>((resolve, reject) => {
            const order: number[] = []

            sync.read(() => order.push(0))
            sync.update(() => order.push(1))
            sync.preRender(() => order.push(2))
            sync.render(() => order.push(3))
            sync.postRender(() => {
                order.push(4)
                if (
                    order[0] === 0 &&
                    order[1] === 1 &&
                    order[2] === 2 &&
                    order[3] === 3 &&
                    order[4] === 4
                ) {
                    resolve()
                } else {
                    reject(order)
                }
            })
        })
    })

    it("cancels callbacks", () => {
        return new Promise<void>((resolve, reject) => {
            let hasFired = false

            const process = sync.render(() => (hasFired = true))

            sync.update(() => cancelSync.render(process))

            sync.postRender(() => (hasFired ? reject(hasFired) : resolve()))
        })
    })

    it("fires callback on current frame if scheduled with `true` within the same step", () => {
        return new Promise<number | string | void>((resolve, reject) => {
            let v = 0

            sync.update(({ timestamp: prevTimestamp }) => {
                v++
                sync.update(
                    ({ timestamp }) => {
                        v++
                        if (timestamp !== prevTimestamp) {
                            reject(`${timestamp} ${prevTimestamp}`)
                        }
                    },
                    false,
                    true
                )
            })

            sync.render(() => (v === 2 ? resolve() : reject(v)))
        })
    })

    it("fires callback on next frame if scheduled with `true` outside the same step", () => {
        return new Promise((resolve: Function, reject: Function) => {
            let v = 0

            sync.update(() => v++)
            sync.update(() => v++, false, true)
            sync.render(() => (v === 2 ? resolve() : reject()))
        })
    })

    it("uses default elapsed time if first fire", () => {
        return new Promise((resolve: Function, reject: Function) => {
            sync.update(({ delta: defaultElapsed }) => {
                setTimeout(
                    () =>
                        sync.update(({ delta }) =>
                            delta === defaultElapsed
                                ? resolve()
                                : reject(defaultElapsed, delta)
                        ),
                    50
                )
            })
        })
    })

    it("correctly cancels", () => {
        return new Promise<void>((resolve, reject) => {
            const callback = () => reject()

            sync.read(() => cancelSync.update(callback))
            sync.update(callback)
            sync.render(() => resolve())
        })
    })

    it("correctly keeps alive", () => {
        return new Promise<void>((resolve) => {
            let v = 0
            sync.update(() => v++, true)
            sync.render(() => v === 2 && resolve(), true)
        })
    })

    it("correctly cancels a keepAlive process", () => {
        return new Promise<number[] | void>((resolve, reject) => {
            let updateCount = 0
            let renderCount = 0

            const update = sync.update(() => {
                updateCount++

                if (updateCount === 4) cancelSync.update(update)
            }, true)

            sync.render(() => {
                renderCount++

                if (renderCount === 6) {
                    if (renderCount !== updateCount) {
                        resolve()
                    } else {
                        reject([renderCount, updateCount])
                    }
                }
            }, true)
        })
    })

    it("correctly keeps alive after a flush", async () => {
        const promise = new Promise<boolean>((resolve) => {
            let v = 0

            sync.update(() => {
                if (v === 2) flushSync.update()
            }, true)

            sync.update(() => {
                v++
                if (v > 6) resolve(true)
            }, true)
        })
        flushSync.update()
        return expect(promise).resolves.toBe(true)
    })
})
