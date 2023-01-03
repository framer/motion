import { invariant } from "hey-listen"
import * as React from "react"
import {
    forwardRef,
    FunctionComponent,
    ReactHTML,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { ReorderContext } from "../../context/ReorderContext"
import { motion } from "../../render/dom/motion"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { ItemLayout, ReorderContextProps } from "./types"
import { checkReorder } from "./utils/check-reorder"
import { useOrderState } from "./utils/use-order-state"

export interface Props<V> {
    /**
     * A HTML element to render this component as. Defaults to `"ul"`.
     *
     * @public
     */
    as?: keyof ReactHTML

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
        onReorder,
        values,
        ...props
    }: Props<V> &
        Omit<HTMLMotionProps<any>, "values"> &
        React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const internalRef = useRef<HTMLElement>()
    const ref = useMemo(
        () => externalRef || internalRef,
        [externalRef, internalRef]
    ) as React.MutableRefObject<any>

    const Component = useConstant(() => motion(as)) as FunctionComponent<
        React.PropsWithChildren<HTMLMotionProps<any> & { ref?: React.Ref<any> }>
    >
    const itemLayouts = useConstant<ItemLayout<V>>(() => new Map())
    const isReordering = useRef(false)

    const { axis, isWrapping, itemsPerAxis } = useOrderState(
        ref,
        values,
        itemLayouts
    )

    invariant(Boolean(values), "Reorder.Group must be provided a values prop")

    const context: ReorderContextProps<any> = {
        axis,
        isWrapping,
        registerItem: (value, layout) => itemLayouts.set(value, layout),
        updateOrder: (id, offset, velocity) => {
            if (isReordering.current) return

            const newValuesOrder = checkReorder(
                values,
                itemLayouts,
                id,
                offset,
                velocity,
                axis,
                isWrapping,
                itemsPerAxis
            )

            console.log(newValuesOrder)

            if (values !== newValuesOrder) {
                isReordering.current = true
                onReorder(newValuesOrder)
            }
        },
    }

    useEffect(() => {
        isReordering.current = false
    })
    return (
        <Component {...props} ref={ref}>
            <ReorderContext.Provider value={context}>
                {children}
            </ReorderContext.Provider>
        </Component>
    )
}

export const Group = forwardRef(ReorderGroup)
