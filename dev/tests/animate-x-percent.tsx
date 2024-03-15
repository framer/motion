import { motion } from "framer-motion"
import * as React from "react"

export const App = () => {
    const ref = React.useRef<HTMLDivElement>(null)

    return (
        <div style={{ height: 100, width: 100, display: "flex" }}>
            <motion.div
                id="test"
                ref={ref}
                initial={{ x: 0 }}
                animate={{ x: "100%", y: "100%" }}
                style={{ width: 100, background: "red" }}
                transition={{ duration: 2 }}
                onUpdate={({ x, y }) => {
                    if (typeof x !== "string" || typeof y !== "string") {
                        ref.current!.innerHTML = "Error"
                    } else if (!x.endsWith("%") || !y.endsWith("%")) {
                        ref.current!.innerHTML = "Error"
                    }
                }}
            />
        </div>
    )
}
