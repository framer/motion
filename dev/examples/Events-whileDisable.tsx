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

const CheckboxButton = ({ name, color }) => {
    const [disabled, setDisabled] = React.useState(false)
    return (
        <>
            <input
                type="checkbox"
                checked={!disabled}
                onChange={(event) => setDisabled(!event.target.checked)}
            />
            <motion.button
                initial={{
                    backgroundColor: "#FFFFFF",
                    scale: 1,
                }}
                whileHover={{
                    backgroundColor: color,
                    scale: 1.1,
                }}
                whileTap={{
                    scale: 0.9,
                }}
                whileFocus={{
                    boxShadow: "0 0 0 2px #5E9ED6, 0 0 0 3px #FFFFFF",
                }}
                whileDisable={{
                    backgroundColor: "#DDDDDD",
                    color: "#AAAAAA",
                    scale: 1,
                }}
                style={buttonStyle}
                disabled={disabled}
            >
                {name}
            </motion.button>
        </>
    )
}

export const App = () => {
    return (
        <ul style={{ listStyle: "none", margin: "none", padding: "none" }}>
            {list.map(({ name, color }) => (
                <li key={name}>
                    <CheckboxButton name={name} color={color} />
                </li>
            ))}
        </ul>
    )
}
