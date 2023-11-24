import { invariant } from "../../utils/errors"
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
     * A ref that gets passed to the group component.
     *
     * @public
     */
    ref?: React.RefObject<HTMLElement>

    /**
     * The axis to reorder along. By default, items will be draggable on this axis.
     * To make draggable on both axes, set `<ReorderItem drag />`
     *
     * @public
     */
    axis?: "x" | "y"

    /**
     * A callback to fire with the new value order. For instance, if the values
     * are provided as a state from `useState`, this could be the set state function.
     *
     * @public
     */
    onReorder: (newOrder: V[]) => void

    /**
     * The latest values state.
     *
     * ```jsx
     * function Component() {
     *   const [items, setItems] = useState([0, 1, 2])
     *
     *   return (
     *     <ReorderGroup values={items} onReorder={setItems}>
     *         {items.map((item) => <ReorderItem key={item} value={item} />)}
     *     </ReorderGroup>
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
    }: Props<V> &
        Omit<HTMLMotionProps<any>, "values"> &
        React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        React.PropsWithChildren<HTMLMotionProps<any> & { ref?: React.Ref<any> }>
    >

    const order: ItemData<V>[] = []
    const isReordering = useRef(false)

    invariant(Boolean(values), "ReorderGroup must be provided a values prop")

    const context: ReorderContextProps<V> = {
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
        updateOrder: (item, offset, velocity) => {
            if (isReordering.current) return

            const newOrder = checkReorder(order, item, offset, velocity)

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
        <Component {...props} ref={externalRef} ignoreStrict>
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
