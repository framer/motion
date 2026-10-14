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
     *
     * `"auto"` reads the grid from the elements' layout. All elements are
     * measured in one batch, the first time the stagger runs for them.
     */
    grid?: [number, number] | "auto"
}

export function getOriginIndex(from: StaggerOrigin, total: number) {
    if (from === "first") {
        return 0
    } else {
        const lastIndex = total - 1
        return from === "last" ? lastIndex : lastIndex / 2
    }
}

/**
 * Read the column and row of each element from its layout position.
 * A new row starts when an element sits lower than, and not to the right
 * of, the element before it (so a wrap in left-to-right reading order).
 * Checking both keeps rows of mixed-height, centred items together.
 *
 * offsetTop/offsetLeft ignore transforms, so elements that are mid-animation
 * are placed by their layout position. All reads happen in one loop with
 * no writes in between, so this triggers at most one layout.
 */
function measureGrid(subjects: ArrayLike<unknown>, xs: number[], ys: number[]) {
    let x = 0
    let y = 0
    let prevTop = 0
    let prevLeft = 0

    for (let j = 0; j < subjects.length; j++) {
        const element = subjects[j] as HTMLElement | null
        let top = element?.offsetTop
        let left = element?.offsetLeft

        if (top === undefined) {
            const box = (element as Element | null)?.getBoundingClientRect?.()
            top = box ? box.top : 0
            left = box ? box.left : 0
        }

        if (j) {
            if (top > prevTop && left! <= prevLeft) {
                y++
                x = 0
            } else {
                x++
            }
        }

        prevTop = top
        prevLeft = left!
        xs[j] = x
        ys[j] = y
    }
}

const isSameSubjects = (a?: ArrayLike<unknown>, b?: ArrayLike<unknown>) => {
    if (!a || !b || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
}

export function stagger(
    duration: number = 0.1,
    { startDelay = 0, from = 0, ease, grid }: StaggerOptions = {}
): DynamicOption<number> {
    /**
     * Distances from the origin for each element count. The final entry
     * holds the distance used to normalise easing.
     */
    const cache: { [total: number]: number[] } = {}

    /**
     * With grid: "auto", distances depend on the elements, not only their
     * count, so they're cached against the last set of elements measured.
     */
    let measuredSubjects: ArrayLike<unknown> | undefined
    let measuredDistances: number[] | undefined

    return (i: number, total: number, subjects?: ArrayLike<unknown>) => {
        const isAuto = grid === "auto" && !!subjects

        let distances = isAuto
            ? isSameSubjects(subjects, measuredSubjects)
                ? measuredDistances
                : undefined
            : cache[total]

        if (!distances) {
            const xs: number[] = []
            const ys: number[] = []

            if (isAuto) {
                measureGrid(subjects!, xs, ys)
            } else {
                const columns = Array.isArray(grid) ? grid[0] : Infinity
                for (let j = 0; j < total; j++) {
                    xs[j] = j % columns
                    ys[j] = Math.floor(j / columns)
                }
            }

            const rows = Array.isArray(grid) ? grid[1] : 1
            const lastX = Math.max(...xs)
            const lastY = Math.max(rows - 1, ...ys)
            /**
             * "first" and "last" are the first and last elements, so in a
             * partly filled grid "last" is the last element, not the
             * bottom-right cell.
             */
            const index =
                from === "first" ? 0 : from === "last" ? total - 1 : from
            let originX = lastX / 2
            let originY = lastY / 2

            if (typeof index === "number") {
                const columns = Array.isArray(grid) ? grid[0] : Infinity
                originX = isAuto ? xs[index] ?? 0 : index % columns
                originY = isAuto ? ys[index] ?? 0 : Math.floor(index / columns)
            }

            distances = []

            for (let j = 0; j < total; j++) {
                const x = xs[j]
                const y = ys[j]
                const edgeX = Math.min(x, lastX - x)
                const edgeY = Math.min(y, lastY - y)

                if (from === "random") {
                    // Inside-out shuffle, so each element gets a distinct step
                    const k = (Math.random() * (j + 1)) | 0
                    distances[j] = distances[k]
                    distances[k] = j
                } else {
                    distances[j] =
                        from === "edges"
                            ? Math.min(
                                  lastX ? edgeX : edgeY,
                                  lastY ? edgeY : edgeX
                              )
                            : Math.hypot(x - originX, y - originY)
                }
            }

            distances.push(
                isAuto || Array.isArray(grid) ? Math.max(...distances) : total
            )

            if (isAuto) {
                measuredSubjects = Array.from(subjects!)
                measuredDistances = distances
            } else {
                cache[total] = distances
            }
        }

        let delay = duration * distances[i]
        const maxDelay = duration * distances[total]

        if (ease && maxDelay) {
            const easingFunction = easingDefinitionToFunction(ease)
            delay = easingFunction(delay / maxDelay) * maxDelay
        }

        return startDelay + delay
    }
}
