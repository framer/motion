import * as React from "react"
import { motion, useViewportScroll, useTransform } from "@framer"

const Item = motion.div({
    default: {
        width: 100,
        height: 100,
        marginBottom: 100,
    },
})

const ItemColor = ({ i, scrollY }) => {
    const base = -500 + i * 200

    const backgroundColor = useTransform(
        scrollY,
        [base, base + 100, base + 200, base + 300],
        ["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)", "rgba(255, 0, 0, 0.2)"]
    )

    return <Item motionValues={{ backgroundColor }} />
}

export const App = () => {
    const viewportScroll = useViewportScroll()

    return (
        <div>
            {Array.from(new Array(100), (x, i) => (
                <ItemColor scrollY={viewportScroll.y} i={i} key={i} />
            ))}
        </div>
    )
}
