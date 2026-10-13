import { Easing, easingDefinitionToFunction } from "motion-utils"
import { DynamicOption } from "../animation/types"

export type StaggerOrigin =
    | "first"
    | "last"
    | "center"
    | "edges"
    | "random"
    | number

export type StaggerOptions = {
    startDelay?: number
    from?: StaggerOrigin
    ease?: Easing
    /**
     * Treat elements as a grid of `[columns, rows]`, in reading order.
     * Delays are then based on the 2D distance from `from`.
     */
    grid?: [number, number]
}

export function getOriginIndex(from: StaggerOrigin, total: number) {
    if (from === "first") {
        return 0
    } else {
        const lastIndex = total - 1
        return from === "last" ? lastIndex : lastIndex / 2
    }
}

export function stagger(
    duration: number = 0.1,
    { startDelay = 0, from = 0, ease, grid }: StaggerOptions = {}
): DynamicOption<number> {
    let distances: number[] = []
    let maxDelay = 0

    return (i: number, total: number) => {
        if (distances.length !== total) {
            const [columns, rows] = grid || [total, 1]
            const lastX = columns - 1
            const lastY = rows - 1
            const isIndex = typeof from === "number"
            const scale = from === "first" ? 0 : from === "last" ? 1 : 0.5
            const originX = isIndex ? from % columns : lastX * scale
            const originY = isIndex ? Math.floor(from / columns) : lastY * scale

            distances = Array.from({ length: total }, (_, j) => {
                const x = j % columns
                const y = Math.floor(j / columns)

                return from === "random"
                    ? j
                    : from === "edges"
                    ? Math.min(x, lastX - x, lastY ? Math.min(y, lastY - y) : x)
                    : Math.hypot(x - originX, y - originY)
            })

            if (from === "random") {
                for (let j = total - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1))
                    ;[distances[j], distances[k]] = [distances[k], distances[j]]
                }
            }

            maxDelay = duration * (grid ? Math.max(...distances) : total)
        }

        let delay = duration * distances[i]

        if (ease && maxDelay) {
            const easingFunction = easingDefinitionToFunction(ease)
            delay = easingFunction(delay / maxDelay) * maxDelay
        }

        return startDelay + delay
    }
}
