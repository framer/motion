import { motion, useInstantTransition } from "framer-motion"
import { useState, useEffect } from "react"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [x, setX] = useState(0)
    const startInstantTransition = useInstantTransition()

    useEffect(() => {
        startInstantTransition(() => setX(100))
    }, [])

    return <motion.div initial={false} style={style} animate={{ x }} />
}
