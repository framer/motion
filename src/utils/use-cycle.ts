import { useState } from "react"
import { wrap } from "@popmotion/popcorn"

/**
 * Cycles through a series of states.
 *
 * @remarks
 * `useCycle` works similar to React's `useState`.
 *
 * It's provided an array of possible states, and returns an array of two arguments.
 *
 * The first item is the current state.
 * The second item is a function that cycles to the next state.
 *
 * ```jsx
 * const [x, cycleX] = useCycle([0, 100, 200])
 *
 * return <motion.div animate={{ x }} onClick={cycleX} />
 * ```
 *
 * By default, the initial state is the first item in the provided array (`0` in the above example).
 *
 * `useCycle` accepts a second parameter, that can set a different index. For example:
 *
 * ```jsx
 * const [x, cycleX] = useCycle([0, 100, 200], 2)
 * ```
 *
 * `x` would initially be `200`.
 *
 * The returned `cycleState` function, by default, cycles to the next item in the array.
 *
 * Optionally, it accepts an index that will cycle to a specific item in the array.
 *
 * @param items - An array of the possible states
 * @param initialIndex - Index of initial state. Optional, defaults to 0
 * @returns [currentState, cycleState]
 *
 * @public
 */
export function useCycle<T>(
    items: T[],
    initialIndex: number = 0
): [T, (i?: any) => void] {
    const numItems = items.length
    const [index, setIndex] = useState(initialIndex)

    return [
        items[index],
        (next?: number) => {
            const newIndex =
                typeof next !== "number" ? wrap(0, numItems, index + 1) : next

            setIndex(newIndex)
        },
    ]
}
