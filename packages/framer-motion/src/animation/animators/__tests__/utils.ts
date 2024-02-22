import { KeyframeGenerator } from "../../generators/types"

export const syncDriver = (interval = 10) => {
    const driver = (update: (v: number) => void) => {
        let isRunning = true
        let elapsed = 0

        return {
            start: () => {
                isRunning = true
                setTimeout(() => {
                    update(elapsed)
                    while (isRunning) {
                        elapsed += interval
                        update(elapsed)
                    }
                }, 0)
            },
            stop: () => {
                isRunning = false
            },
            now: () => elapsed,
        }
    }

    return driver
}

export function animateSync(
    animation: KeyframeGenerator<string | number>,
    timeStep = 200,
    round = true
) {
    const output: Array<string | number> = []
    let step = 0
    let done = false

    while (!done) {
        const latest = animation.next(step * timeStep)
        output.push(
            round && typeof latest.value === "number"
                ? Math.round(latest.value)
                : latest.value
        )
        done = latest.done
        step++
    }

    return output
}
