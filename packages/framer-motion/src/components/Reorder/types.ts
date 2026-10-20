import { Box, Point } from "motion-utils"
import { KeyboardEvent, RefObject } from "react"
import { HTMLElements } from "../../render/html/supported-elements"

export type ReorderAxis = "x" | "y" | "xy"

export interface ReorderContextProps<T> {
    axis: ReorderAxis
    registerItem: (item: T, layout: Box) => void
    updateOrder: (item: T, offset: Point, velocity: Point) => void
    groupRef: RefObject<Element | null>
    hasReordered: { current: boolean }
    onKeyDown: (
        event: KeyboardEvent<Element>,
        item: T,
        from: T[] | undefined,
        grab: (element: Element, from?: T[]) => void
    ) => void
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
