import { Point } from "../../../projection/geometry/types"
import { moveItem } from "../../../utils/array"
import { mix } from "../../../utils/mix"
import { ItemLayout } from "../types"

/**
 * Check whether items should reorder.
 *
 * TODO: This currently only supports items with uniform sizes for
 * multidimensional reordering.
 */
export function checkReorder<T>(
    order: T[],
    layouts: ItemLayout<T>,
    value: T,
    offset: Point,
    velocity: Point,
    axis: "x" | "y",
    isWrappingItems: boolean,
    itemsPerAxis: number
): T[] {
    const crossAxis = axis === "x" ? "y" : "x"

    /**
     * If the pointer isn't moving then return existing order.
     */
    if (!velocity[axis] && !velocity[crossAxis]) return order

    /**
     * If currently dragged item doesn't exist in the provided order then just return
     * the existing order.
     */
    const index = order.findIndex((item) => item === value)
    if (index === -1) return order

    const nextAxisOffset =
        velocity[axis] === 0 ? 0 : velocity[axis] / Math.abs(velocity[axis])
    const nextCrossAxisOffset =
        velocity[crossAxis] === 0
            ? 0
            : velocity[crossAxis] / Math.abs(velocity[crossAxis])

    const nextItemMainAxis = layouts.get(order[index + nextAxisOffset])
    const nextItemSecondaryAxis = layouts.get(
        order[index + nextCrossAxisOffset * itemsPerAxis]
    )

    const item = order[index]
    const itemLayout = layouts.get(item)

    if (nextItemMainAxis && itemLayout && velocity[axis]) {
        const nextLayoutMainAxis = nextItemMainAxis[axis]
        const nextItemCenterMainAxis = mix(
            nextLayoutMainAxis.min,
            nextLayoutMainAxis.max,
            0.5
        )

        if (
            (nextAxisOffset === 1 &&
                itemLayout[axis].max + offset[axis] > nextItemCenterMainAxis &&
                ((isWrappingItems &&
                    (index + nextAxisOffset) % itemsPerAxis !== 0) ||
                    !isWrappingItems)) ||
            (nextAxisOffset === -1 &&
                itemLayout[axis].min + offset[axis] < nextItemCenterMainAxis &&
                ((isWrappingItems &&
                    (index + nextAxisOffset) % itemsPerAxis !==
                        itemsPerAxis - 1) ||
                    !isWrappingItems))
        ) {
            return moveItem(order, index, index + nextAxisOffset)
        }
    }

    if (
        itemLayout &&
        nextItemSecondaryAxis &&
        velocity[crossAxis] &&
        isWrappingItems
    ) {
        const nextLayoutSecondaryAxis = nextItemSecondaryAxis[crossAxis]
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
