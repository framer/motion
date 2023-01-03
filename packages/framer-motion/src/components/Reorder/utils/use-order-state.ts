import { invariant } from "hey-listen"
import { useEffect, useState } from "react"
import { ItemLayout } from "../types"
import { detectAxis } from "./detect-axis"

export interface OrderState {
    axis: "x" | "y"
    isWrapping: boolean
    itemsPerAxis: number
}

export function useOrderState<T>(
    ref: React.MutableRefObject<any>,
    items: T[],
    itemLayouts: ItemLayout<T>
): OrderState {
    const [state, setState] = useState<OrderState>({
        axis: "x",
        isWrapping: false,
        itemsPerAxis: 0,
    })
    console.log(items)
    useEffect(() => {
        if (!ref.current) return

        const analyzeItems = () => {
            /**
             * If we have 0 or 1 items we don't need to allow reordering.
             */
            if (items.length < 2) {
                setState({
                    axis: "x",
                    isWrapping: false,
                    itemsPerAxis: 1,
                })

                return
            }

            const firstItemLayout = itemLayouts.get(items[0])
            const secondItemLayout = itemLayouts.get(items[1])

            invariant(
                Boolean(firstItemLayout && secondItemLayout),
                "No measurements detected. Do all values passed to Reorder.Group match with Reorder.Item components?"
            )

            const axis = detectAxis(firstItemLayout!, secondItemLayout!)
            const crossAxis = axis === "x" ? "y" : "x"

            let itemsPerAxis = items.length
            let isWrapping = false
            for (let i = 1; i < items.length; i++) {
                const itemLayout = itemLayouts.get(items[i])
                const prevItemLayout = itemLayouts.get(items[i - 1])

                invariant(
                    Boolean(itemLayout && prevItemLayout),
                    "Missing item measurements. Do all values passed to Reorder.Group match with Reorder.Item components?"
                )

                if (
                    itemLayout![crossAxis].min > prevItemLayout![crossAxis].min
                ) {
                    itemsPerAxis = i // Should this not be + 1?
                    isWrapping = true
                    break
                }
            }

            setState({ axis, isWrapping, itemsPerAxis })
        }

        /**
         * TODO: Double check this is neccessary. Currently this should fall out of sync
         * with the item sizes so should really just force a new render
         */
        const observer = new ResizeObserver(analyzeItems)
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [items, itemLayouts, ref])

    return state
}
