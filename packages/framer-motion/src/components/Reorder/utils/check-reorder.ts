import { Point } from "../../../projection/geometry/types"
import { moveItem } from "../../../utils/array"
import { mix } from "../../../utils/mix"
import { ItemLayout } from "../types"

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
    if (!velocity[axis] && !velocity[crossAxis]) return order

    const index = order.findIndex((item) => item === value)
    if (index === -1) return order

    const nextOffsetMainAxis =
        velocity[axis] === 0 ? 0 : velocity[axis] / Math.abs(velocity[axis])
    const nextOffsetSecondaryAxis =
        velocity[crossAxis] === 0
            ? 0
            : velocity[crossAxis] / Math.abs(velocity[crossAxis])

    const nextItemMainAxis = layouts.get(order[index + nextOffsetMainAxis])
    const nextItemSecondaryAxis = layouts.get(
        order[index + nextOffsetSecondaryAxis * itemsPerAxis]
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
            (nextOffsetMainAxis === 1 &&
                itemLayout[axis].max + offset[axis] > nextItemCenterMainAxis &&
                ((isWrappingItems &&
                    (index + nextOffsetMainAxis) % itemsPerAxis !== 0) ||
                    !isWrappingItems)) ||
            (nextOffsetMainAxis === -1 &&
                itemLayout[axis].min + offset[axis] < nextItemCenterMainAxis &&
                ((isWrappingItems &&
                    (index + nextOffsetMainAxis) % itemsPerAxis !==
                        itemsPerAxis - 1) ||
                    !isWrappingItems))
        ) {
            return moveItem(order, index, index + nextOffsetMainAxis)
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
            (nextOffsetSecondaryAxis === 1 &&
                itemLayout[crossAxis].max + offset[crossAxis] >
                    nextItemCenterSecondaryAxis) ||
            (nextOffsetSecondaryAxis === -1 &&
                itemLayout[crossAxis].min + offset[crossAxis] <
                    nextItemCenterSecondaryAxis)
        ) {
            return moveItem(
                order,
                index,
                index + nextOffsetSecondaryAxis * itemsPerAxis
            )
        }
    }
    return order
}
