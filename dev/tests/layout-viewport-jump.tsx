import { motion } from "framer-motion"
import * as React from "react"

/**
 * This test is designed to run at the Cypress default of 1000x660
 * It is scripted to scroll down 100px before triggering the layout change
 */
export const App = () => {
    const [state, setState] = React.useState(true)
    const params = new URLSearchParams(window.location.search)
    const nested = params.get("nested") || false

    let content = (
        <div style={{ ...container, height: state ? 1000 : "auto" }}>
            <motion.div
                layout
                id="box"
                style={box}
                onClick={() => setState(!state)}
                transition={{ ease: () => 0.1 }}
            />
        </div>
    )

    if (nested) {
        content = (
            <motion.div layoutScroll id="scrollable" style={scrollable}>
                {content}
            </motion.div>
        )
    }

    return content
}

const scrollable = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    overflow: "scroll",
} as any

const container = {
    marginTop: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
}

const box = {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#ffaa00",
}
