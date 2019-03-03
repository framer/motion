import { useState } from "react"
import { wrap } from "@popmotion/popcorn"

type Cycle = (i?: number) => void

type CycleState<T> = [T, Cycle]

/**
 * Cycles through a series of states. Can be used to toggle between or cycle through animations.
 *
 * ```jsx
 * function App() {
 *   const [x, cycleX] = useCycle([0, 100, 200])
 *
 *   return <Frame animate={{ x: x }} onClick={() => cycleX()} />
 * }
 * ```
 *
 * @param items - An array of the possible states
 * @param initialIndex - Index of initial state. Defaults to `0`
 * @returns [currentState, cycleState]
 *
 * @public
 */
export function useCycle<T>(
    items: T[],
    initialIndex: number = 0
): CycleState<T> {
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
