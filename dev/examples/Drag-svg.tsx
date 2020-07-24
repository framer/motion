import * as React from "react"
import { motion } from "../../src"

export const App = () => {
    return (
        <svg
            viewBox="0 0 500 500"
            style={{
                width: 500,
                height: 500,
                border: "2px solid white",
                borderRadius: 20,
            }}
        >
            <motion.circle
                cx={300}
                cy={300}
                r={50}
                fill={"white"}
                drag
                // drag
                // dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                // whileTap={{ scale: 0.95 }}
                // onTap={handleTap}
                // onTapStart={handleTapStart}
                // onTapCancel={handleTapCancel}
                // onDrag={handleDrag}
                // onDragStart={handleDragStart}
                // onDragEnd={handleDragEnd}
                // style={styleA}
            />
        </svg>
    )
}
