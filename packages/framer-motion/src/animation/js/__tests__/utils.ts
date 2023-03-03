import { Animation } from "../../legacy-popmotion/types"

export const syncDriver =
    (interval = 10) =>
    (update: (v: number) => void) => {
        let isRunning = true
        return {
            start: () => {
                setTimeout(() => {
                    update(0)
                    while (isRunning) update(interval)
                }, 0)
            },
            stop: () => (isRunning = false),
        }
    }

export function animateSync(
    animation: Animation<number | string>,
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
