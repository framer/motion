import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [opacity, setOpacity] = useState(1)

    return (
        <motion.div
            style={style}
            initial="hidden"
            animate="show"
            whileHover="hover"
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: 1.8,
                    },
                },
                hover: {
                    transition: {
                        staggerChildren: 0.03,
                        delayChildren: 0.1,
                        staggerDirection: -1,
                    },
                },
            }}
        >
            <motion.div
                onClick={() => setOpacity(opacity === 1 ? 0 : 1)}
                transition={{ duration: 0.5 }}
                style={{ width: 50, height: 50, background: "red" }}
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                    hover: {
                        opacity: 0,
                        // transition: {
                        //     repeat: 1,
                        //     repeatType: "reverse",
                        // },
                    },
                }}
            />
        </motion.div>
    )
}
