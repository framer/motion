import { moveItem } from "../../../utils/array"
import { mix } from "../../../utils/mix"
import { ItemLayout } from "../types"

export function checkReorder<T>(
    order: T[],
    layouts: ItemLayout<T>,
    value: T,
    offset: { x: number; y: number },
    velocity: { x: number; y: number },
    mainAxis: "x" | "y",
    isWrappingItems: boolean,
    itemsPerAxis: number
): T[] {
    const secondaryAxis = mainAxis === "x" ? "y" : "x"
    if (!velocity[mainAxis] && !velocity[secondaryAxis]) return order

    const index = order.findIndex((item) => item === value)
    if (index === -1) return order

    const nextOffsetMainAxis =
        velocity[mainAxis] === 0
            ? 0
            : velocity[mainAxis] / Math.abs(velocity[mainAxis])
    const nextOffsetSecondaryAxis =
        velocity[secondaryAxis] === 0
            ? 0
            : velocity[secondaryAxis] / Math.abs(velocity[secondaryAxis])

    const nextItemMainAxis = layouts.get(order[index + nextOffsetMainAxis])
    const nextItemSecondaryAxis = layouts.get(
        order[index + nextOffsetSecondaryAxis * itemsPerAxis]
    )

    const item = order[index]
    const itemLayout = layouts.get(item)

    if (nextItemMainAxis && itemLayout && velocity[mainAxis]) {
        const nextLayoutMainAxis = nextItemMainAxis[mainAxis]
        const nextItemCenterMainAxis = mix(
            nextLayoutMainAxis.min,
            nextLayoutMainAxis.max,
            0.5
        )

        if (
            (nextOffsetMainAxis === 1 &&
                itemLayout[mainAxis].max + offset[mainAxis] >
                    nextItemCenterMainAxis &&
                ((isWrappingItems &&
                    (index + nextOffsetMainAxis) % itemsPerAxis !== 0) ||
                    !isWrappingItems)) ||
            (nextOffsetMainAxis === -1 &&
                itemLayout[mainAxis].min + offset[mainAxis] <
                    nextItemCenterMainAxis &&
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
        velocity[secondaryAxis] &&
        isWrappingItems
    ) {
        const nextLayoutSecondaryAxis = nextItemSecondaryAxis[secondaryAxis]
        const nextItemCenterSecondaryAxis = mix(
            nextLayoutSecondaryAxis.min,
            nextLayoutSecondaryAxis.max,
            0.5
        )
        if (
            (nextOffsetSecondaryAxis === 1 &&
                itemLayout[secondaryAxis].max + offset[secondaryAxis] >
                    nextItemCenterSecondaryAxis) ||
            (nextOffsetSecondaryAxis === -1 &&
                itemLayout[secondaryAxis].min + offset[secondaryAxis] <
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
