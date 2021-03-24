import { motion } from "@framer"
import * as React from "react"

export const App = () => {
    const [state, setState] = React.useState(true)

    return (
        <motion.div
            id="parent"
            onClick={() => setState(!state)}
            layout
            style={{
                position: "absolute",
                top: state ? 0 : 200,
                left: state ? 0 : 200,
                width: state ? 200 : 400,
                height: 200,
                background: "red",
            }}
            transition={{ ease: () => 0.5 }}
        >
            <motion.div
                id="child"
                layout
                style={{
                    width: state ? 100 : 200,
                    height: 100,
                    background: "blue",
                }}
                transition={{
                    delay: 100,
                }}
            />
        </motion.div>
    )
}
