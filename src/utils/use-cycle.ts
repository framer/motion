import { useState } from "react"
import { wrap } from "@popmotion/popcorn"

/**
 * Cycles through a series of states.
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
