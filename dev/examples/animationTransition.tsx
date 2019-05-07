import * as React from "react"
import { motion, useCycle } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}
const panel = {
    hidden: { opacity: 0, left: "-100%" },
    visible: {
        opacity: 1,
        left: "0%",
        transition: { type: false },
    },
}

export const App = () => {
    const [isVisible, toggleVisibility] = useCycle(false, true)

    return (
        <>
            <motion.div
                style={{
                    position: "absolute",
                    background: "white",
                    top: 0,
                    bottom: 0,
                    width: 300,
                }}
                top={0}
                bottom={0}
                width={300}
                background="white"
                initial={isVisible ? panel.visible : panel.hidden}
                animate={isVisible ? panel.visible : panel.hidden}
            />
            <motion.div
                style={{
                    position: "absolute",
                    background: "white",
                    borderRadius: "50%",
                    top: 40,
                    right: 40,
                    width: 50,
                    height: 50,
                }}
                background="white"
                borderRadius="50%"
                top={40}
                right={40}
                size={50}
                color="black"
                onClick={toggleVisibility}
            >
                ╳
            </motion.div>
        </>
    )
}
