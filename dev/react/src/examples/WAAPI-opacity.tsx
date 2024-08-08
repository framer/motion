import { useState } from "react"
import { motion, useMotionValue } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

const Boxes = ({ opacity }) => {
    const value = useMotionValue(1)
    return (
        <>
            <motion.div
                initial={{ opacity: 1, transform: "translateX(0px)" }}
                animate={{
                    opacity,
                    transform:
                        opacity === 0 ? "translateX(100px)" : "translateX(0px)",
                }}
                transition={{ duration: 1, ease: "linear" }}
                style={style}
            >
                {"content"}
            </motion.div>
            <motion.div
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity, x: opacity === 0 ? 100 : 0 }}
                transition={{ duration: 1, ease: "linear" }}
                style={{
                    ...style,
                    opacity: value,
                    background: "red",
                }}
            >
                {"content"}
            </motion.div>
        </>
    )
}

export const App = () => {
    const [opacity, setOpacity] = useState(1)

    return (
        <div
            style={{ display: "flex", flexWrap: "wrap" }}
            onClick={() => setOpacity(opacity === 1 ? 0 : 1)}
        >
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
            <Boxes opacity={opacity} />
        </div>
    )
}
