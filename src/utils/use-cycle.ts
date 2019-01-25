import { useState } from "react"
import { wrap } from "@popmotion/popcorn"

// We return a function that accepts any to permit onClick={cycle} syntax
export const useCycle = <T>(
    items: T[],
    initialIndex: number = 0
): [T, (i?: any) => void] => {
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
