import { mix } from "popmotion"
import { moveItem } from "../../../utils/array"
import { ItemData } from "../types"

export function checkReorder<T>(
    order: ItemData<T>[],
    value: T,
    offset: { x: number; y: number },
    velocity: { x: number; y: number },
    mainAxis: "x" | "y",
    isWrappingItems: boolean,
    itemsPerAxis: number
): ItemData<T>[] {
    const secondaryAxis = mainAxis === "x" ? "y" : "x"
    if (!velocity[mainAxis] && !velocity[secondaryAxis]) return order

    const index = order.findIndex((item) => item.value === value)
    if (index === -1) return order

    const nextOffsetMainAxis = velocity[mainAxis] > 0 ? 1 : -1
    const nextOffsetSecondaryAxis = velocity[mainAxis] > 0 ? 1 : -1

    const nextItemMainAxis = order[index + nextOffsetMainAxis]
    const nextItemSecondaryAxis =
        order[index + nextOffsetSecondaryAxis * itemsPerAxis]

    const item = order[index]

    if (!nextItemMainAxis) return order

    const nextLayoutMainAxis = nextItemMainAxis?.layout[mainAxis]
    const nextItemCenterMainAxis = mix(
        nextLayoutMainAxis.min,
        nextLayoutMainAxis.max,
        0.5
    )

    if (
        (nextOffsetMainAxis === 1 &&
            item?.layout[mainAxis].max + offset[mainAxis] > nextItemCenterMainAxis &&
            ((isWrappingItems &&
                (index + nextOffsetMainAxis) % itemsPerAxis !== 0) ||
                !isWrappingItems)) ||
        (nextOffsetMainAxis === -1 &&
            item?.layout[mainAxis].min + offset[mainAxis] < nextItemCenterMainAxis &&
            ((isWrappingItems &&
                (index + nextOffsetMainAxis) % itemsPerAxis !==
                    itemsPerAxis - 1) ||
                !isWrappingItems))
    ) {
        return moveItem(order, index, index + nextOffsetMainAxis)
    }

    if (!nextItemSecondaryAxis || !isWrappingItems) return order

    const nextLayoutSecondaryAxis = nextItemSecondaryAxis?.layout[secondaryAxis]
    const nextItemCenterSecondaryAxis = mix(
        nextLayoutSecondaryAxis.min,
        nextLayoutSecondaryAxis.max,
        0.5
    )
    if (
        (nextOffsetSecondaryAxis === 1 &&
            item?.layout[secondaryAxis].max + offset[secondaryAxis] >
                nextItemCenterSecondaryAxis) ||
        (nextOffsetSecondaryAxis === -1 &&
            item?.layout[secondaryAxis].min + offset[secondaryAxis] <
                nextItemCenterSecondaryAxis)
    ) {
        return moveItem(
            order,
            index,
            index + nextOffsetSecondaryAxis * itemsPerAxis
        )
    }
    return order
}
