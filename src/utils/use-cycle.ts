import { useState, useRef } from "react"
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
 *   const [x, cycleX] = useCycle(0, 50, 100)
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
 * @param items... - items to cycle through
 * @returns [currentState, cycleState]
 *
 * @public
 */
export function useCycle<T>(...items: T[]): CycleState<T> {
    const index = useRef(0)
    const [item, setItem] = useState(items[index.current])

    return [
        item,
        (next?: number) => {
            index.current =
                typeof next !== "number"
                    ? wrap(0, items.length, index.current + 1)
                    : next

            setItem(items[index.current])
        },
    ]
}
