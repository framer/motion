import * as React from "react"
import { motion } from "framer-motion"

export const App = () => {
    const [open, setOpen] = React.useState(true)
    return (
        <div>
            {open && (
                <motion.div
                    style={{
                        position: "absolute",
                        backgroundColor: "black",
                        width: "10px",
                        height: "10px",
                    }}
                    animate={{ left: [0, 100, 0] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        times: [0, 0.5, 1],
                        ease: "easeInOut",
                    }}
                ></motion.div>
            )}
            <button onClick={() => setOpen(false)}>Disable animation</button>
        </div>
    )
}
