import { Box, Point } from "motion-utils"
import { RefObject } from "react"
import { HTMLElements } from "../../render/html/supported-elements"

export type ReorderAxis = "x" | "y" | "xy"

export interface ReorderContextProps<T> {
    axis: ReorderAxis
    registerItem: (item: T, layout: Box) => void
    updateOrder: (item: T, offset: Point, velocity: Point) => void
    groupRef: RefObject<Element | null>
    hasReordered: { current: boolean }
    /**
     * Moves `item` for an arrow `key`, returning whether the key belongs to
     * the group's axis.
     */
    moveItem: (item: T, key: string) => boolean
}

export interface ItemData<T> {
    value: T
    layout: Box
}

// Reorder component type helpers
export type ReorderElementTag = keyof HTMLElements

// Default elements for each component
export type DefaultGroupElement = "ul"
export type DefaultItemElement = "li"
