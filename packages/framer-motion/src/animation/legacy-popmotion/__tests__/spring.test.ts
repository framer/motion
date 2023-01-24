import { AnimationOptions } from "../../types"
import { findSpring, spring } from "../spring"
import { animateSync } from "./utils"

describe("spring", () => {
    test("Runs animations with default values ", () => {
        expect(animateSync(spring({ keyframes: [0, 1] }), 200)).toEqual([
            0, 1, 1, 1, 1, 1, 1, 1,
        ])
    })
    test("Underdamped spring", () => {
        expect(
            animateSync(
                spring({
                    keyframes: [100, 1000],
                    stiffness: 300,
                    restSpeed: 10,
                    restDelta: 0.5,
                }),
                200
            )
        ).toEqual([100, 1343, 873, 1046, 984, 1005, 998, 1001, 1000])
    })

    test("Velocity passed to underdamped spring", () => {
        const settings: AnimationOptions<number> = {
            keyframes: [100, 1000],
            stiffness: 300,
            restSpeed: 10,
            restDelta: 0.5,
        }

        const noVelocity = animateSync(spring(settings), 200)
        const velocity = animateSync(
            spring({ ...settings, velocity: 1000 }),
            200
        )

        expect(noVelocity).not.toEqual(velocity)
    })

    test("Critically damped spring", () => {
        expect(
            animateSync(
                spring({
                    keyframes: [100, 1000],
                    stiffness: 100,
                    damping: 20,
                    restSpeed: 10,
                    restDelta: 0.5,
                }),
                200
            )
        ).toEqual([100, 635, 918, 984, 997, 1000])
    })

    test("Velocity passed to critically spring", () => {
        const settings = {
            keyframes: [100, 1000],
            stiffness: 100,
            damping: 20,
            restSpeed: 10,
            restDelta: 0.5,
        }

        const noVelocity = animateSync(spring(settings), 200)
        const velocity = animateSync(
            spring({ ...settings, velocity: 1000 }),
            200
        )

        expect(noVelocity).not.toEqual(velocity)
    })

    test("Overdamped spring", () => {
        expect(
            animateSync(
                spring({
                    keyframes: [100, 1000],
                    stiffness: 300,
                    damping: 100,
                    restSpeed: 10,
                    restDelta: 0.5,
                }),
                200
            )
        ).toEqual([
            100, 499, 731, 855, 922, 958, 977, 988, 993, 996, 998, 999, 999,
            1000,
        ])
    })
    test("Overdamped spring with very high stiffness/damping", () => {
        expect(
            animateSync(
                spring({
                    keyframes: [100, 1000],
                    stiffness: 1000000,
                    damping: 10000000,
                    restDelta: 1,
                    restSpeed: 10,
                }),
                200
            )
        ).toEqual([100, 1000])
    })

    test("Velocity passed to overdamped spring", () => {
        const settings = {
            keyframes: [100, 1000],
            stiffness: 300,
            damping: 100,
            restSpeed: 10,
            restDelta: 0.5,
        }

        const noVelocity = animateSync(spring(settings), 200)
        const velocity = animateSync(
            spring({ ...settings, velocity: 1000 }),
            200
        )

        expect(noVelocity).not.toEqual(velocity)
    })

    test("Spring defined with bounce and duration is same as just bounce", () => {
        const settings = {
            keyframes: [100, 1000],
            bounce: 0.1,
        }

        const withoutDuration = animateSync(spring(settings), 200)
        const withDuration = animateSync(
            spring({ ...settings, duration: 800 }),
            200
        )

        expect(withoutDuration).toEqual(withDuration)
        // Check duration order of magnitude is correct
        expect(withoutDuration.length).toBeGreaterThan(4)
    })
})

describe("findSpring", () => {
    test.only("find spring", () => {
        const testFindSpring = (options: AnimationOptions<number>) => {
            const foundSpring = findSpring(options)
            console.log("looking for", options, "found", foundSpring)

            const { bounce, duration = 500, ...originalOptions } = options
            const testSpring = spring({ ...originalOptions, ...foundSpring })

            const timeAccuracy = 50 //ms

            // Aim to hit the done threshold with specific accuracy
            expect(testSpring.next(duration - timeAccuracy).done).toEqual(false)
            expect(testSpring.next(duration + timeAccuracy).done).toEqual(true)
        }

        const bounces = [0, 0.5, 1]
        const durations = [100, 500, 5000]
        const keyframes = [
            [0, 100],
            [300, -100],
            [0, 0.5],
        ]
        const velocityFactors = [0, 2, -2]
        const masses = [0.5, 1, 3]

        for (let b = 0; b < bounces.length; b++) {
            for (let d = 0; d < durations.length; d++) {
                for (let k = 0; k < keyframes.length; k++) {
                    for (let v = 0; v < velocityFactors.length; v++) {
                        for (let m = 0; m < masses.length; m++) {
                            testFindSpring({
                                bounce: bounces[b],
                                keyframes: keyframes[k],
                                velocity:
                                    velocityFactors[v] *
                                    (keyframes[k][0] - keyframes[k][1]),
                                mass: masses[m],
                                duration: durations[d],
                            })
                        }
                    }
                }
            }
        }
    })
})
