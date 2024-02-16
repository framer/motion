import { moveItem } from "../../../utils/array"
import { mixNumber } from "../../../utils/mix/number"
import { ItemData } from "../types"

export function checkReorder<T>(
    order: ItemData<T>[],
    value: T,
    offset: number,
    velocity: number
): ItemData<T>[] {
    if (!velocity) return order

    const index = order.findIndex((item) => item.value === value)

    if (index === -1) return order

    const nextOffset = velocity > 0 ? 1 : -1
    const nextItem = order[index + nextOffset]

    if (!nextItem) return order

    const item = order[index]
    const nextLayout = nextItem.layout
    const nextItemCenter = mixNumber(nextLayout.min, nextLayout.max, 0.5)

    if (
        (nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
        (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
    ) {
        return moveItem(order, index, index + nextOffset)
    }

    return order
}
