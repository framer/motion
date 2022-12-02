import { syncDriver } from "./utils"
import { inertia } from "../inertia"
import { InertiaOptions } from "../types"

async function testInertia(
    options: InertiaOptions,
    expectation: number[],
    resolve: () => void
) {
    const output: number[] = []

    inertia({
        driver: syncDriver(200),
        ...options,
        onUpdate: (v) => output.push(Math.round(v)),
        onComplete: () => {
            expect(output).toEqual(expectation)
            resolve()
        },
    })
}

describe("inertia", () => {
    test("Stays still without velocity", async () => {
        return new Promise<void>((resolve) => {
            testInertia({ from: 50 }, [50], resolve)
        })
    })

    test("Decays upwards with positive velocity", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                { from: 50, velocity: 100 },
                [
                    50, 69, 83, 94, 102, 109, 114, 118, 121, 123, 124, 126, 127,
                    128, 128, 129, 129, 130,
                ],
                resolve
            )
        })
    })

    test("Decays downwards with negative velocity", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                { from: 50, velocity: -100 },
                [
                    50, 31, 17, 6, -2, -9, -14, -18, -21, -23, -24, -26, -27,
                    -28, -28, -29, -29, -30,
                ],
                resolve
            )
        })
    })

    test("Inverse is same as absolute", async () => {
        return new Promise<void>((resolve) => {
            const positive: number[] = []
            const negative: number[] = []

            inertia({
                bounceDamping: 40,
                bounceStiffness: 200,
                max: 1221,
                min: 0,
                restDelta: 1,
                restSpeed: 10,
                timeConstant: 750,
                velocity: 2970,
                driver: syncDriver(20),
                onUpdate: (v) => positive.push(Math.round(v)),
                onComplete: () => {
                    inertia({
                        bounceDamping: 40,
                        bounceStiffness: 200,
                        max: 0,
                        min: -1221,
                        restDelta: 1,
                        restSpeed: 10,
                        timeConstant: 750,
                        velocity: -2970,
                        driver: syncDriver(20),
                        onUpdate: (v) => negative.push(Math.round(v)),
                        onComplete: () => {
                            expect(negative.map(Math.abs)).toEqual(positive)
                            resolve()
                        },
                    })
                },
            })
        })
    })

    test("Springs towards min if encountered", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                { from: 50, min: 0, velocity: -100 },
                [50, 31, 17, 6, -2, -2, 1, 0, 0],
                resolve
            )
        })
    })

    test("Springs towards max if encountered", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                { from: 50, max: 100, velocity: 100 },
                [50, 69, 83, 94, 102, 102, 99, 100, 100],
                resolve
            )
        })
    })

    test("Springs towards min if starts outside of boundary", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                {
                    from: -100,
                    bounceStiffness: 200,
                    min: 0,
                },
                [-100, 26, -3, -1, 1, -1, 0],
                resolve
            )
        })
    })

    test("Springs towards max if starts outside of boundary", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                {
                    from: 200,
                    bounceStiffness: 200,
                    max: 100,
                },
                [200, 74, 103, 101, 99, 101, 100],
                resolve
            )
        })
    })

    test("Decays towards target returned from modifyTarget", async () => {
        return new Promise<void>((resolve) => {
            testInertia(
                { from: 50, velocity: 100, modifyTarget: () => 100 },
                [
                    50, 62, 71, 78, 83, 87, 90, 92, 94, 95, 97, 97, 98, 98, 99,
                    100,
                ],
                resolve
            )
        })
    })

    test("Can be stopped as spring", async () => {
        return new Promise<void>((resolve) => {
            const output: number[] = []

            const controls = inertia({
                driver: syncDriver(200),
                from: 200,
                bounceStiffness: 200,
                max: 100,
                onUpdate: (v) => {
                    output.push(Math.round(v))
                    controls.stop()
                },
            })

            setTimeout(() => {
                expect(output.length).toEqual(1)
                resolve()
            }, 20)
        })
    })

    test("Can be stopped as decay", async () => {
        return new Promise<void>((resolve) => {
            const output: number[] = []

            const controls = inertia({
                driver: syncDriver(200),
                from: 200,
                bounceStiffness: 200,
                onUpdate: (v: number) => {
                    output.push(Math.round(v) as number)
                    controls.stop()
                },
            })

            setTimeout(() => {
                expect(output.length).toEqual(1)
                resolve()
            }, 20)
        })
    })
})
