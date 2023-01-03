import { Box } from "../../projection/geometry/types"

export interface ReorderContextProps<T> {
    axis: "x" | "y"
    isWrapping: boolean
    registerItem: (id: T, layout: Box) => void
    updateOrder: (
        id: T,
        offset: { x: number; y: number },
        velocity: { x: number; y: number }
    ) => void
}

export type ItemLayout<T> = Map<T, Box>
