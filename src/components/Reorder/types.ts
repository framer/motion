import { Axis, Box } from "../../projection/geometry/types"

export interface ReorderContextProps<T> {
    axis: "x" | "y"
    registerItem: (id: T, layout: Box) => void
    updateOrder: (id: T, offset: number, velocity: number) => void
}

export interface RenderGroupProps<T> {
    as?: string
    axis: "x" | "y"
    onReorder: (order: T[]) => void
}

export interface RenderTriggerProps {
    as?: string
}

export interface ItemData<T> {
    value: T
    layout: Axis
}
