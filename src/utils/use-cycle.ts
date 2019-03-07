import { useState } from "react"
import { wrap } from "@popmotion/popcorn"

type Cycle = (i?: number) => void

type CycleState<T> = [T, Cycle]

/**
 * Cycles through a series of visual properties. Can be used to toggle between or cycle through animations. It works similar to `useState` in React. It is provided an initial array of possible states, and returns an array of two arguments.
 *
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, useCycle } from "framer"
 *
 * export function MyComponent() {
 *   const [x, cycleX] = useCycle([0, 50, 100])
 *
 *   return (
 *     <Frame
 *       animate={{ x: x }}
 *       onTap={() => cycleX()}
 *      />
 *    )
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
