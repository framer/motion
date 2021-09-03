import { invariant } from "hey-listen"
import * as React from "react"
import { createContext, useContext, useEffect, useRef } from "react"
import { Box } from "../../projection/geometry/types"
import { motion } from "../../render/dom/motion"
import { useMotionValue } from "../../value/use-motion-value"
import { useTransform } from "../../value/use-transform"
import { checkReorder } from "./check-reorder"
import { ItemData, ReorderComponents, ReorderContextProps } from "./types"

const ReorderContext = createContext<ReorderContextProps | null>(null)
export const Reorder: ReorderComponents = {
    /**
     *
     */
    Group: ({ children, axis, onReorder }) => {
        const order: ItemData[] = []
        const isReordering = useRef(false)

        const context: ReorderContextProps = {
            axis,
            registerItem: (id, layout) => {
                order.push({ id, layout: layout[axis] })
            },
            updateOrder: (id, offset, velocity) => {
                if (isReordering.current) return

                const newOrder = checkReorder(order, id, offset, velocity)

                if (order !== newOrder) {
                    isReordering.current = true
                    onReorder(newOrder.map((item) => item.id))
                }
            },
        }

        useEffect(() => {
            isReordering.current = false
        })

        return (
            <ReorderContext.Provider value={context}>
                {children}
            </ReorderContext.Provider>
        )
    },

    /**
     * TODO: Tests
     *  - Applies style
     *  - Figure out zindex
     *  - Rename id?
     */
    Item: ({ children, id, style }) => {
        const context = useContext(ReorderContext)
        const point = {
            x: useMotionValue(0),
            y: useMotionValue(0),
        }
        const zIndex = useTransform([point.x, point.y], ([x, y]) =>
            x || y ? 1 : 0
        )
        const layout = useRef<Box | null>(null)

        invariant(
            Boolean(context),
            "Reorder.Item must be a child of Reorder.Group"
        )

        const { axis, registerItem, updateOrder } = context!

        useEffect(() => {
            registerItem(id, layout.current!)
        })

        return (
            <motion.div
                style={{ ...style, x: point.x, y: point.y, zIndex }}
                layout
                drag={axis}
                dragConstraints={originConstraints}
                dragElastic={1}
                onDrag={(_event, { velocity }) => {
                    velocity[axis] &&
                        updateOrder(id, point[axis].get(), velocity[axis])
                }}
                onLayoutMeasure={(measured) => (layout.current = measured)}
            >
                {children}
            </motion.div>
        )
    },
}

const originConstraints = { top: 0, left: 0, right: 0, bottom: 0 }
