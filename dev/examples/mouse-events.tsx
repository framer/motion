import * as React from "react"
import { useRef } from "react"
import { usePanGesture } from "@framer"
import { Box } from "../styled"
export const App = () => {
    const ref = useRef(null)
    const [point, setPoint] = React.useState({ x: 0, y: 0 })
    usePanGesture(
        {
            onPan: ({ devicePoint }) => {
                setPoint(devicePoint)
            },
        },
        ref
    )
    return <Box ref={ref} style={{ left: point.x, top: point.y, position: "absolute" }} />
}
