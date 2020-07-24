import * as React from "react"
import { motion, useCycle } from "../../src"

const transition = {
    type: "spring",
    stiffness: 100,
    damping: 15,
}

export const App = () => {
    const [centre, nextCentre] = useCycle(100, 400)
    return (
        <motion.svg
            viewBox="0 0 500 500"
            style={{
                width: 500,
                height: 500,
                border: "2px solid white",
                borderRadius: 20,
                marginLeft: centre === 100 ? -500 : 400,
            }}
            layout
            transition={transition}
        >
            <motion.circle
                cx={centre}
                cy={centre}
                r={50}
                fill={"white"}
                layout
                transition={transition}
                onClick={() => nextCentre()}
            />
        </motion.svg>
    )
}
