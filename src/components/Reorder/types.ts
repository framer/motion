import * as React from "react"
import { MotionStyle } from "../../motion/types"
import { Axis, Box } from "../../projection/geometry/types"

export interface ReorderComponents {
    Group: React.FunctionComponent<RenderGroupProps>
    Item: React.FunctionComponent<RenderItemProps>
}

export interface ReorderContextProps {
    axis: "x" | "y"
    registerItem: (id: string, layout: Box) => void
    updateOrder: (id: string, offset: number, velocity: number) => void
}

export interface RenderGroupProps {
    axis: "x" | "y"
    onReorder: (order: string[]) => void
}

export interface RenderItemProps {
    id: string
    style?: MotionStyle
}

export interface ItemData {
    id: string
    layout: Axis
}
