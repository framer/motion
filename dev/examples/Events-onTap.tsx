import * as React from "react"
import { motion } from "@framer"

/**
 * An example of the onTap event
 */

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    return (
        <motion.div
            style={style}
            onTapStart={() => console.log("onTapStart")}
            onTap={() => console.log("onTap")}
            onTapCancel={() => console.log("onTapCancel")}
        />
    )
}
