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
     * Moves `item` for an arrow `key`, or restores the order in `from` for
     * Escape, returning whether the key was handled.
     */
    moveItem: (item: T, key: string, from: T[]) => boolean
    values: T[]
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
