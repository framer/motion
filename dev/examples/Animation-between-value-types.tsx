import * as React from "react"
import { motion, useCycle } from "@framer"

/**
 * An example of animating between different value types
 */

export const App = () => {
    const [width, nextWidth] = useCycle(0, "100%", "calc(50% + 100px)")
    return (
        <div style={stretch} onClick={() => nextWidth()}>
            <motion.div
                initial={false}
                animate={{ width }}
                transition={{ duration: 5 }}
                style={style}
            />
        </div>
    )
}

const style = {
    width: 100,
    height: 100,
    background: "white",
}

const stretch: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}
