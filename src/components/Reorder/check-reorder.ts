import { mix } from "popmotion"
import { moveItem } from "../../utils/array"
import { ItemData } from "./types"

export function checkReorder(
    order: ItemData[],
    id: string,
    offset: number,
    velocity: number
): ItemData[] {
    if (!velocity) return order

    const index = order.findIndex((item) => item.id === id)

    if (index === -1) return order

    const nextOffset = velocity > 0 ? 1 : -1
    const nextItem = order[index + nextOffset]

    if (!nextItem) return order

    const item = order[index]
    const nextLayout = nextItem.layout
    const nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5)

    if (
        (nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
        (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
    ) {
        console.log(order, id, offset, velocity, nextOffset)
        return moveItem(order, index, index + nextOffset)
    }

    return order
}
