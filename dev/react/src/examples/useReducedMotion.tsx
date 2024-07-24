import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [isVisible, setIsVisible] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const transition = shouldReduceMotion ? { type: false } : { duration: 1 }
    const variants = {
        visible: { opacity: 1, transition },
        hidden: { opacity: 0, transition },
    }

    useEffect(() => {
        setTimeout(() => setIsVisible(!isVisible), 1500)
    }, [isVisible])

    return (
        <motion.div animate={isVisible ? "visible" : "hidden"} initial={false}>
            <motion.div variants={variants} style={style} />
        </motion.div>
    )
}
