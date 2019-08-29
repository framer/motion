import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "@framer"

function removeFromArray(array, index) {
    return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function App() {
    const [tasks, setTasks] = useState([
        "Learn React",
        "Prototype with Framer",
        "Get Superpowers",
        "Conquer the universe",
    ])
    const liStyle = {
        padding: 20,
        borderRadius: 10,
        backgroundColor: "white",
        margin: 10,
        listStyle: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,.25)",
        minWidth: 300,
    }

    return (
        <div className="App">
            <button
                onClick={() =>
                    setTasks(ts => removeFromArray(ts, ts.length - 2))
                }
            >
                remove
            </button>
            <ul>
                <AnimatePresence>
                    {tasks.map((task, idx) => (
                        <motion.li
                            key={task}
                            drag="x"
                            style={liStyle}
                            positionTransition
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            onDragEnd={(_, info) => {
                                if (info.point.x > 50) {
                                    setTasks(ts => removeFromArray(ts, idx))
                                }
                            }}
                        >
                            {task}
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    )
}
