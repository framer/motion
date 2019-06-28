import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}
const styleB = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    return (
        <motion.div drag style={styleA}>
            <input />
            <input type="radio" id="huey" name="drone" value="huey" checked />
            <input type="radio" id="b" name="drone" value="b" checked />
            <textarea />
            <select>
                <option>Test</option>
            </select>
        </motion.div>
    )
}
