import { invariant } from "hey-listen"
import * as React from "react"
import {
    PropsWithChildren,
    ReactHTML,
    FunctionComponent,
    useContext,
    useEffect,
    useRef,
} from "react"
import { Box, motion, useMotionValue, useTransform } from "../.."
import { ReorderContext } from "../../context/ReorderContext"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { isMotionValue } from "../../value/utils/is-motion-value"

interface Props<V> {
    as?: keyof ReactHTML
    value: V
}

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
    return isMotionValue(value) ? value : useMotionValue(defaultValue)
}

/**
 * TODO: Fix slippage when dragging
 */
export function Item<V>({
    children,
    style,
    value,
    as = "li",
    ...props
}: Props<V> & HTMLMotionProps<any> & PropsWithChildren<{}>) {
    const Component = useConstant(() => motion(as)) as FunctionComponent<
        HTMLMotionProps<any>
    >

    const context = useContext(ReorderContext)
    const point = {
        x: useDefaultMotionValue(style?.x),
        y: useDefaultMotionValue(style?.y),
    }

    const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
        latestX || latestY ? 1 : 0
    )

    const layout = useRef<Box | null>(null)

    invariant(Boolean(context), "Reorder.Item must be a child of Reorder.Group")

    const { axis, registerItem, updateOrder } = context!

    useEffect(() => {
        registerItem(value, layout.current!)
    })

    return (
        <Component
            drag={axis}
            {...props}
            style={{ ...style, x: point.x, y: point.y, zIndex }}
            layout
            dragConstraints={originConstraints}
            dragElastic={1}
            onDrag={(_event, { velocity }) => {
                velocity[axis] &&
                    updateOrder(value, point[axis].get(), velocity[axis])
            }}
            onLayoutMeasure={(measured) => (layout.current = measured)}
        >
            {children}
        </Component>
    )
}

const originConstraints = { top: 0, left: 0, right: 0, bottom: 0 }
