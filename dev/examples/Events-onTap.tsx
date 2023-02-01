import * as React from "react"
import { motion } from "framer-motion"

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
        <>
            <motion.div
                style={style}
                onTapStart={() => console.log("onTapStart")}
                onTap={() => console.log("onTap")}
                onTapCancel={() => console.log("onTapCancel")}
                whileTap={{ scale: 0.6 }}
                whileFocus={{ outline: "5px solid blue" }}
                initial={{ outline: "0px solid blue" }}
            />
            <motion.input
                type="text"
                whileTap={{ scale: 0.6 }}
                whileFocus={{ outline: "5px solid blue" }}
                initial={{ outline: "0px solid blue" }}
            />
        </>
    )
}
