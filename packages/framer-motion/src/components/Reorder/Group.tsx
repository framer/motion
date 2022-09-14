import { invariant } from "hey-listen"
import * as React from "react"
import {
    forwardRef,
    FunctionComponent,
    ReactElement,
    ReactHTML,
    useEffect,
    useRef,
    useState,
} from "react"
import { ReorderContext } from "../../context/ReorderContext"
import { motion } from "../../render/dom/motion"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { ItemData, ReorderContextProps } from "./types"
import { checkReorder } from "./utils/check-reorder"
import { addDomEvent } from "../../events/use-dom-event"

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
    children: ReactElement<any>[]
}

export function ReorderGroup<V>(
    {
        children,
        as = "ul",
        onReorder,
        values,
        ...props
    }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        React.PropsWithChildren<HTMLMotionProps<any> & { ref?: React.Ref<any> }>
    >
    const order: ItemData<V>[] = []
    const isReordering = useRef(false)

    const ref = useRef<any | undefined>()
    const [axis, setAxis] = useState<"x" | "y">("x")
    const itemsPerAxis = useRef<number>(0)
    const [isWrappingItems, setIsWrappingItems] = useState(false)

    useEffect(() => {
        if(externalRef) ref.current = externalRef
    }, [externalRef]);


    useEffect(() => {
        if (!ref.current) return

        const calculateRowsNumber = () => {
            const children = ref.current.children
            invariant(
                children.length > 1,
                "At least two children components are necessary."
            )
            const newAxis = children[0].offsetTop === children[1].offsetTop ? "x" : "y"
            setAxis(newAxis)
            itemsPerAxis.current = children.length
            const offset = newAxis === 'x' ? 'offsetTop' : 'offsetLeft'
            for (let i = 1; i < children.length; i++) {
                if (children[i][offset] > children[i - 1][offset]) {
                    itemsPerAxis.current = i
                    setIsWrappingItems(i !== children.length && i !== 1)
                    break
                }
            }
        }
        calculateRowsNumber()
        addDomEvent(window, "resize", calculateRowsNumber)
    }, [])
    // TODO test external ref
    // TODO reduce number of rerenders

    invariant(Boolean(values), "Reorder.Group must be provided a values prop")

    const context: ReorderContextProps<any> = {
        axis: axis,
        isWrappingItems: isWrappingItems,
        registerItem: (value, layout) => {
            /**
             * Ensure entries can't add themselves more than once
             */
            if (
                layout &&
                order.findIndex((entry) => value === entry.value) === -1
            ) {
                order.push({ value, layout: { x: layout.x, y: layout.y } })
                order.sort((a, b) =>
                    compareMin(a, b, axis, isWrappingItems)
                )
            }
        },
        updateOrder: (id, offset, velocity) => {
            if (isReordering.current) return

            const newOrder = checkReorder(
                order,
                id,
                offset,
                velocity,
                axis,
                isWrappingItems,
                itemsPerAxis.current
            )

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
        <Component {...props} ref={ref}>
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

function compareMin<V>(
    a: ItemData<V>,
    b: ItemData<V>,
    axis: "x" | "y",
    isWrappingItems = false
) {
    let comparedAxis = axis
    if (isWrappingItems) comparedAxis = axis === "x" ? "y" : "x"
    return a.layout[comparedAxis].min - b.layout[comparedAxis].min
}
