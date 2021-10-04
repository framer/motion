import * as React from "react"
import {
    forwardRef,
    FunctionComponent,
    ReactHTML,
    useEffect,
    useRef,
} from "react"
import { ReorderContext } from "../../context/ReorderContext"
import { motion } from "../../render/dom/motion"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { ItemData, ReorderContextProps } from "./types"
import { checkReorder } from "./utils/check-reorder"

export interface Props<V> {
    as?: keyof ReactHTML
    axis?: "x" | "y"
    onReorder: (newOrder: V[]) => void
}

export function ReorderGroup<V>(
    {
        children,
        as = "ul",
        axis = "y",
        onReorder,
        ...props
    }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        HTMLMotionProps<any> & { ref?: React.Ref<any> }
    >

    const order: ItemData<V>[] = []
    const isReordering = useRef(false)

    const context: ReorderContextProps<any> = {
        axis,
        registerItem: (value, layout) => {
            order.push({ value, layout: layout[axis] })
        },
        updateOrder: (id, offset, velocity) => {
            if (isReordering.current) return

            const newOrder = checkReorder(order, id, offset, velocity)

            if (order !== newOrder) {
                isReordering.current = true
                onReorder(newOrder.map(getValue))
            }
        },
    }

    useEffect(() => {
        isReordering.current = false
    })

    return (
        <Component {...props} ref={externalRef}>
            <ReorderContext.Provider value={context}>
                {children}
            </ReorderContext.Provider>
        </Component>
    )
}

export const Group = forwardRef(ReorderGroup)

function getValue<V>(item: ItemData<V>) {
    return item.value
}
