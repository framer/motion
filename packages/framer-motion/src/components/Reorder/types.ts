import { Axis, Box } from "../../projection/geometry/types"

export interface ReorderContextProps<T> {
    axis: "x" | "y"
    isWrappingItems: boolean
    registerItem: (id: T, layout: Box) => void
    updateOrder: (
        id: T,
        offset: { x: number; y: number },
        velocity: { x: number; y: number }
    ) => void
}

export interface ItemData<T> {
    value: T
    layout: { x: Axis; y: Axis }
}
