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
    itemLayouts: ItemLayout<T>,
    axisOverride: "x" | "y"
): OrderState {
    const [state, setState] = useState<OrderState>({
        axis: "x",
        isWrapping: false,
        itemsPerAxis: 0,
    })

    useEffect(() => {
        if (!ref.current) return

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

        const axis =
            axisOverride || detectAxis(firstItemLayout!, secondItemLayout!)
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

            if (itemLayout![crossAxis].min > prevItemLayout![crossAxis].min) {
                itemsPerAxis = i // Should this not be + 1?
                isWrapping = true
                break
            }
        }

        setState({ axis, isWrapping, itemsPerAxis })
    }, [items, itemLayouts, ref])

    return state
}
