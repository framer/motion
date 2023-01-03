import { Point } from "../../../projection/geometry/types"
import { moveItem } from "../../../utils/array"
import { mix } from "../../../utils/mix"
import { ItemLayout } from "../types"

function nextOffset(velocity: number): number {
    return !velocity ? 0 : Math.round(velocity / Math.abs(velocity))
}

/**
 * Check whether items should reorder.
 *
 * TODO: This currently only supports items with uniform sizes for
 * multidimensional reordering. The next steps towards this would be ditching
 * the itemsPerAxis calculation and doing proper 2D detection (rather
 * than this approach which first checks ordering on the current row
 * and then subsequently checks swapping rows.)
 */
export function checkReorder<T>(
    order: T[],
    layouts: ItemLayout<T>,
    value: T,
    offset: Point,
    velocity: Point,
    mainAxis: "x" | "y",
    isWrappingItems: boolean,
    itemsPerAxis: number
): T[] {
    const crossAxis = mainAxis === "x" ? "y" : "x"

    /**
     * If the pointer isn't moving then return existing order.
     */
    if (!velocity[mainAxis] && !velocity[crossAxis]) return order

    /**
     * If currently dragged item doesn't exist in the provided order then just return
     * the existing order.
     */
    const index = order.findIndex((item) => item === value)
    if (index === -1) return order

    const nextMainAxisOffset = nextOffset(velocity[mainAxis])
    const nextCrossAxisOffset = nextOffset(velocity[crossAxis])

    const nextMainAxisItem = layouts.get(order[index + nextMainAxisOffset])

    const item = order[index]
    const itemLayout = layouts.get(item)

    /**
     * Check if item needs to reorder along the main axis.
     */
    if (nextMainAxisItem && itemLayout && velocity[mainAxis]) {
        const nextLayout = nextMainAxisItem[mainAxis]
        const nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5)

        let pastNextCenter = false
        let isOnSameLine = false

        if (nextMainAxisOffset === 1) {
            pastNextCenter =
                itemLayout[mainAxis].max + offset[mainAxis] > nextItemCenter
            isOnSameLine =
                isWrappingItems &&
                (index + nextMainAxisOffset) % itemsPerAxis !== 0
        } else if (nextMainAxisOffset === -1) {
            pastNextCenter =
                itemLayout[mainAxis].min + offset[mainAxis] < nextItemCenter
            isOnSameLine =
                isWrappingItems &&
                (index + nextMainAxisOffset) % itemsPerAxis !== itemsPerAxis - 1
        }

        if (pastNextCenter && (isOnSameLine || !isWrappingItems)) {
            return moveItem(order, index, index + nextMainAxisOffset)
        }
    }

    const nextCrossAxisItem = layouts.get(
        order[index + nextCrossAxisOffset * itemsPerAxis]
    )

    /**
     * If items are wrapping and we're not reordering along the main axis,
     * check if item needs to reorder along the cross-axis.
     */
    if (
        itemLayout &&
        nextCrossAxisItem &&
        velocity[crossAxis] &&
        isWrappingItems
    ) {
        const nextLayoutSecondaryAxis = nextCrossAxisItem[crossAxis]
        const nextItemCenterSecondaryAxis = mix(
            nextLayoutSecondaryAxis.min,
            nextLayoutSecondaryAxis.max,
            0.5
        )

        if (
            (nextCrossAxisOffset === 1 &&
                itemLayout[crossAxis].max + offset[crossAxis] >
                    nextItemCenterSecondaryAxis) ||
            (nextCrossAxisOffset === -1 &&
                itemLayout[crossAxis].min + offset[crossAxis] <
                    nextItemCenterSecondaryAxis)
        ) {
            return moveItem(
                order,
                index,
                index + nextCrossAxisOffset * itemsPerAxis
            )
        }
    }
    return order
}
