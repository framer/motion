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
        <motion.div
            layout
            transition={{ duration: 2 }}
            initial={{ borderRadius: 20 }}
            onPress={() => cycle()}
            style={{ ...style, height: open ? 300 : 100 }}
        />
    )
}
