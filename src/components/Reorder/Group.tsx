import { invariant } from "hey-listen"
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
    /**
     * A HTML element to render this component as. Defaults to `"ul"`.
     *
     * @public
     */
    as?: keyof ReactHTML

    /**
     * The axis to reorder along. By default, items will be draggable on this axis.
     * To make draggable on both axes, set `<Reorder.Item drag />`
     *
     * @public
     */
    axis?: "x" | "y"

    // TODO: This would be better typed as V, but that doesn't seem
    // to correctly infer type from values
    /**
     * A callback to fire with the new value order. For instance, if the values
     * are provided as a state from `useState`, this could be the set state function.
     *
     * @public
     */
    onReorder: (newOrder: any[]) => void

    /**
     * The latest values state.
     *
     * ```jsx
     * function Component() {
     *   const [items, setItems] = useState([0, 1, 2])
     *
     *   return (
     *     <Reorder.Group values={items} onReorder={setItems}>
     *         {items.map((item) => <Reorder.Item key={item} value={item} />)}
     *     </Reorder.Group>
     *   )
     * }
     * ```
     *
     * @public
     */
    values: V[]
}

export function ReorderGroup<V>(
    {
        children,
        as = "ul",
        axis = "y",
        onReorder,
        values,
        ...props
    }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        HTMLMotionProps<any> & { ref?: React.Ref<any> }
    >

    const order: ItemData<V>[] = []
    const isReordering = useRef(false)

    invariant(Boolean(values), "Reorder.Group must be provided a values prop")

    const context: ReorderContextProps<any> = {
        axis,
        registerItem: (value, layout) => {
            /**
             * Ensure entries can't add themselves more than once
             */
            if (
                layout &&
                order.findIndex((entry) => value === entry.value) === -1
            ) {
                order.push({ value, layout: layout[axis] })
                order.sort(compareMin)
            }
        },
        updateOrder: (id, offset, velocity) => {
            if (isReordering.current) return

            const newOrder = checkReorder(order, id, offset, velocity)

            if (order !== newOrder) {
                isReordering.current = true
                onReorder(
                    newOrder
                        .map(getValue)
                        .filter((value) => values.indexOf(value) !== -1)
                )
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

function compareMin<V>(a: ItemData<V>, b: ItemData<V>) {
    return a.layout.min - b.layout.min
}
