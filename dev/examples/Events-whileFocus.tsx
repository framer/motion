import * as React from "react"
import { motion } from "@framer"

/**
 * An example of whileFocus dom event
 */

const list = [
    { name: "Apple", color: "#66CC33" },
    { name: "Banana", color: "#ffe135" },
    { name: "Strawberry", color: "#fc5a8d" },
    { name: "Blueberry", color: "#4f86f7" },
]

const buttonStyle = {
    border: "none",
    outline: "none",
    width: 200,
    height: 50,
    margin: 5,
    fontSize: 15,
    borderRadius: 10,
    color: "#000000",
}

export const App = () => {
    return (
        <ul style={{ listStyle: "none", margin: "none", padding: "none" }}>
            {list.map(({ name, color }) => (
                <li key={name}>
                    <motion.button
                        initial={{ backgroundColor: "#FFFFFF" }}
                        whileHover={{
                            backgroundColor: color,
                            scale: 1.1,
                        }}
                        whileFocus={{
                            backgroundColor: color,
                            scale: 1,
                        }}
                        style={buttonStyle}
                    >
                        {name}
                    </motion.button>
                </li>
            ))}
        </ul>
    )
}
