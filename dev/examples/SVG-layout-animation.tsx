import * as React from "react"
import { motion, useCycle } from "../../src"

const transition = {
    type: "spring",
    stiffness: 2,
    damping: 15,
}

export const App = () => {
    const [isOpen, toggleOpen] = useCycle(true, false)
    return (
        <motion.div
            layout
            transition={transition}
            style={{
                ...container,
                left: isOpen ? 50 : "auto",
                right: isOpen ? "auto" : 50,
            }}
        >
            <svg
                viewBox="0 0 500 500"
                style={{
                    width: 500,
                    height: 500,
                }}
            >
                <motion.circle
                    cx={isOpen ? 100 : 400}
                    cy={isOpen ? 100 : 400}
                    r={50}
                    fill={"white"}
                    drag
                    layout
                    transition={transition}
                    onDragStart={() => toggleOpen()}
                />
            </svg>
        </motion.div>
    )
}

const container: React.CSSProperties = {
    width: 500,
    height: 500,
    border: "2px solid white",
    borderRadius: 20,
    position: "absolute",
    background: "rgba(0,0,0,0.3)",
}
