import { useState, useEffect } from "react";
import { motion } from "framer-motion"

const styleA = {
    width: 200,
    height: 200,
    borderRadius: 20,
}

export function App() {
    const [backgroundColor, setBackgroundColor] = useState("darkgray")
    useEffect(() => {
        const listener = () => {
            // The re-render will have updateBlockedByResize as true and cause clearMeasurements() to be called.
            setBackgroundColor("pink")
        }
        window.addEventListener("resize", listener)
        return () => window.removeEventListener("resize", listener)
    }, [backgroundColor])

    return (
        <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: 0 }}
            style={{ ...styleA, backgroundColor }}
        />
    )
}
