import { motion } from "framer-motion"
import * as React from "react"

export const App = () => {
    const containerRef = React.useRef(null)

    return (
        <div id="container" style={container} ref={containerRef}>
            <div style={{ flex: "0 0 400px" }} />
            <motion.div
                id="box"
                initial={false}
                transition={{ duration: 0.01 }}
                animate={{ background: "rgba(255,0,0,1)" }}
                whileInView={{ background: "rgba(0,255,0,1)" }}
                viewport={{ root: containerRef }}
                style={{ width: 100, height: 100, flexShrink: 0 }}
            />
        </div>
    )
}

const container = {
    width: 300,
    overflow: "scroll",
    display: "flex",
}
