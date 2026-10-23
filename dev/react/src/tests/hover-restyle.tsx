import { motion } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * A static style value that whileHover animates, on a component that
 * re-renders when the hover ends. With ?restyle=true that re-render also
 * changes the style value.
 *
 * The background colour of #box is recorded every frame to window.bgFrames.
 */
declare global {
    interface Window {
        bgFrames: string[]
    }
}

window.bgFrames = []

export const App = () => {
    const restyle =
        new URLSearchParams(window.location.search).get("restyle") === "true"
    const [count, setCount] = useState(0)

    useEffect(() => {
        let id = requestAnimationFrame(function record() {
            const box = document.getElementById("box")
            if (box) window.bgFrames.push(getComputedStyle(box).backgroundColor)
            id = requestAnimationFrame(record)
        })
        return () => cancelAnimationFrame(id)
    }, [])

    return (
        <motion.div
            id="box"
            data-count={count}
            style={{
                position: "absolute",
                top: 100,
                left: 100,
                width: 200,
                height: 200,
                backgroundColor:
                    restyle && count ? "rgb(0, 128, 0)" : "rgb(0, 0, 255)",
            }}
            whileHover={{ backgroundColor: "rgb(255, 0, 0)" }}
            transition={{ duration: 0.5, ease: "linear" }}
            onHoverEnd={() => setCount((c) => c + 1)}
        />
    )
}
