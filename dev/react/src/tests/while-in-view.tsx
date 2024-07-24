import { motion } from "framer-motion"
import { useState } from "react";

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const amount = params.get("amount") || undefined
    const once = params.get("once") ? true : undefined
    const margin = params.get("margin") || undefined
    const deleteObserver = params.get("delete") || undefined
    const disableFallback = params.get("disableFallback") || false
    const [inViewport, setInViewport] = useState(false)

    if (deleteObserver) {
        window.IntersectionObserver = undefined
    }

    return (
        <div style={container}>
            <motion.div
                id="box"
                initial={false}
                transition={{ duration: 0.01 }}
                animate={{ background: "rgba(255,0,0,1)" }}
                whileInView={{ background: "rgba(0,255,0,1)" }}
                viewport={{ amount, once, margin, fallback: !disableFallback }}
                style={{ width: 100, height: 100 }}
                onViewportEnter={() => setInViewport(true)}
                onViewportLeave={() => setInViewport(false)}
            >
                {inViewport ? "In" : "Out"}
            </motion.div>
        </div>
    )
}

const container = {
    paddingTop: 700,
}
