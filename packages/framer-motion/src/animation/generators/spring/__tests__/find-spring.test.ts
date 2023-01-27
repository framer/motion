import { findSpring } from "../find-spring"
import { spring } from "../spring"

describe("findSpring", () => {
    test.only("find spring", () => {
        const testFindSpring = (options: any) => {
            console.log("looking for", options)

            const foundSpring = findSpring(options)
            console.log("found", foundSpring)

            const { bounce, duration = 500, ...originalOptions } = options
            const testSpring = spring({ ...originalOptions, ...foundSpring })

            const timeAccuracy = Math.max(50, options.duration! * 0.05) //ms

            let i = 0
            let foundDuration: null | number = null
            while (foundDuration === null) {
                i++
                const state = testSpring.next(i * 10)
                if (state.done) foundDuration = i * 10
            }
            console.log({ foundDuration })
            console.log(
                duration - timeAccuracy,
                testSpring.next(duration - timeAccuracy).done
            )
            console.log(
                duration + timeAccuracy,
                testSpring.next(duration + timeAccuracy).done
            )

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
