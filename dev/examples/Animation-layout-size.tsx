import * as React from "react"
import { motion, useCycle } from "@framer"

/**
 * An example of animating the boxShadow property.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [open, cycle] = useCycle(false, true)

    return (
        <div
            onClick={() => cycle()}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <motion.div
                layout
                transition={{ duration: 2 }}
                initial={{ borderRadius: 20 }}
                style={{
                    ...style,
                    height: open ? 300 : 100,
                }}
            />
        </div>
    )
}
