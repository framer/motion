import { ReactHTML } from "hoist-non-react-statics/node_modules/@types/react"
import * as React from "react"
import { motion } from "../.."
import { MotionStyle } from "../../motion/types"
import { HTMLMotionProps } from "../../render/html/types"
import { useConstant } from "../../utils/use-constant"
import { MotionValue } from "../../value"

interface Props<V> {
    as?: keyof ReactHTML
    x?: MotionValue<number>
    y?: MotionValue<number>
    value: V
    style?: MotionStyle
}

export function Item<V>({
    children,
    value,
    style,
    x,
    y,
    as,
    ...props
}: Props<V> & HTMLMotionProps<typeof as>) {
    const Component = useConstant(() => motion(as))

    return <Component {...props}></Component>
}

// ({ children, value, style, x, y, as = "li", ...props }) => {
//   const Component = useConstant(() => motion<typeof as>(as))
//   const context = useContext(ReorderContext)
//   const point = {
//       x: x || useMotionValue(0),
//       y: y || useMotionValue(0),
//   }
//   const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
//       latestX || latestY ? 1 : 0
//   )
//   const layout = useRef<Box | null>(null)

//   invariant(
//       Boolean(context),
//       "Reorder.Item must be a child of Reorder.Group"
//   )

//   const { axis, registerItem, updateOrder } = context!

//   useEffect(() => {
//       registerItem(value, layout.current!)
//   })

//   return (
//       <Component
//           {...props}
//           style={{ ...style, x: point.x, y: point.y, zIndex }}
//           layout
//           drag
//           dragConstraints={originConstraints}
//           dragElastic={1}
//           onDrag={(_event, { velocity }) => {
//               velocity[axis] &&
//                   updateOrder(value, point[axis].get(), velocity[axis])
//           }}
//           onLayoutMeasure={(measured) => (layout.current = measured)}
//       >
//           {children}
//       </Component>
//   )
// }

const originConstraints = { top: 0, left: 0, right: 0, bottom: 0 }
