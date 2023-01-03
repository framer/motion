import { Box, Point } from "../../projection/geometry/types"

export interface ReorderContextProps<T> {
    axis: "x" | "y"
    isWrapping: boolean
    registerItem: (id: T, layout: Box) => void
    updateOrder: (id: T, offset: Point, velocity: Point) => void
}

export type ItemLayout<T> = Map<T, Box>
