import { motion } from "@framer"
import * as React from "react"

const Box = () => {
    const [hover, setHover] = React.useState(false)
    return (
        <motion.div
            id="container"
            layout
            style={{
                width: 80,
                height: 80,
                position: "relative",
            }}
            transition={{ duration: 1 }}
        >
            <motion.div
                id="box"
                data-testid="box"
                layout
                style={hover ? b : a}
                onClick={(e) => {
                    e.stopPropagation()
                    setHover((h) => (h ? false : true))
                }}
                transition={{ duration: 1 }}
            >
                <motion.div
                    id="inner-box"
                    layout
                    style={{
                        position: "absolute",
                        width: 40,
                        height: 40,
                        left: "calc(50% - 20px)",
                        top: "calc(50% - 20px)",
                        backgroundColor: "blue",
                    }}
                    transition={{
                        duration: 1,
                    }}
                />
            </motion.div>
        </motion.div>
    )
}
export const App = () => {
    const [hover, setHover] = React.useState(false)

    return (
        <motion.div style={{ width: 400, height: 400, position: "relative" }}>
            <motion.div
                id="parent"
                layout
                style={{
                    position: "absolute",
                    width: 200,
                    height: 200,
                    left: hover ? "100%" : 0,
                    top: "50%",
                    backgroundColor: "green",
                }}
                onClick={() => setHover((h) => (h ? false : true))}
                transition={{ duration: 5, ease: () => 0.5 }}
                transformTemplate={(_, generated) =>
                    `translateY(-50%) ${generated}`
                }
            >
                <Box />
            </motion.div>
        </motion.div>
    )
}

const box = {
    position: "absolute",
    backgroundColor: "red",
    inset: 0,
}

const a = {
    ...box,
}

const b = {
    ...box,
    inset: -20,
}
