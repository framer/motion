import { invariant } from "hey-listen"
import * as React from "react"
import {
    ReactHTML,
    FunctionComponent,
    useContext,
    useEffect,
    useRef,
    forwardRef,
} from "react"
import { ReorderContext } from "../../context/ReorderContext"
import { Box } from "../../projection/geometry/types"
import { motion } from "../../render/dom/motion"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { useMotionValue } from "../../value/use-motion-value"
import { useTransform } from "../../value/use-transform"
import { isMotionValue } from "../../value/utils/is-motion-value"

export interface Props<V> {
    /**
     * A HTML element to render this component as. Defaults to `"li"`.
     *
     * @public
     */
    as?: keyof ReactHTML

    /**
     * The value in the list that this component represents.
     *
     * @public
     */
    value: V

    /**
     * A subset of layout options primarily used to disable layout="size"
     *
     * @public
     * @default true
     */
    layout?: true | "position"
}

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
    return isMotionValue(value) ? value : useMotionValue(defaultValue)
}

export function ReorderItem<V>(
    {
        children,
        style = {},
        value,
        as = "li",
        onDrag,
        layout = true,
        ...props
    }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<{}>,
    externalRef?: React.Ref<any>
) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        React.PropsWithChildren<HTMLMotionProps<any> & { ref?: React.Ref<any> }>
    >

    const context = useContext(ReorderContext)
    const point = {
        x: useDefaultMotionValue(style.x),
        y: useDefaultMotionValue(style.y),
    }

    const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
        latestX || latestY ? 1 : "unset"
    )

    const measuredLayout = useRef<Box | null>(null)

    invariant(Boolean(context), "Reorder.Item must be a child of Reorder.Group")

    const { axis, registerItem, updateOrder } = context!

    useEffect(() => {
        registerItem(value, measuredLayout.current!)
    }, [context])

    return (
        <Component
            drag={axis}
            {...props}
            dragSnapToOrigin
            style={{ ...style, x: point.x, y: point.y, zIndex }}
            layout={layout}
            onDrag={(event, gesturePoint) => {
                const { velocity } = gesturePoint
                velocity[axis] &&
                    updateOrder(value, point[axis].get(), velocity[axis])

                onDrag && onDrag(event, gesturePoint)
            }}
            onLayoutMeasure={(measured) => {
                measuredLayout.current = measured
            }}
            ref={externalRef}
            ignoreStrict
        >
            {children}
        </Component>
    )
}

export const Item = forwardRef(ReorderItem)
