import * as React from "react"
import { motion, useCycle } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
    position: "absolute",
}

export const App = () => {
    const [position, cycle] = useCycle(
        { top: "auto", bottom: 0 },
        { top: 0, bottom: "auto" }
    )

    return (
        <motion.div
            initial={position}
            animate={position}
            transition={{ duration: 5 }}
            style={style}
            onTap={() => cycle()}
        />
    )
}
