import { motion, MotionConfig } from "@framer"
import * as React from "react"

export const App = () => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <MotionConfig transition={{ duration: 0.1 }}>
            <motion.div
                id="a"
                layoutId="box"
                style={a}
                onClick={() => setIsOpen(true)}
            />
            {isOpen ? (
                <motion.div
                    id="b"
                    layoutId="box"
                    style={b}
                    onClick={() => setIsOpen(false)}
                />
            ) : null}
        </MotionConfig>
    )
}

const box = {
    background: "red",
}

const a = {
    ...box,
    width: 100,
    height: 200,
}

const b = {
    ...box,
    width: 300,
    height: 300,
    background: "blue",
    borderRadius: 20,
}
