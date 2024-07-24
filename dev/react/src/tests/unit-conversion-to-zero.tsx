import { animate } from "framer-motion"
import { useEffect } from "react"

/**
 * An example of animating between different value types
 */

export const App = () => {
    useEffect(() => {
        animate("#box", { y: ["100%", 0] }, { duration: 10, ease: () => 0 })
    }, [])

    return (
        <div
            style={{
                width: 100,
                height: 100,
                background: "#ffaa00",
            }}
            id="box"
        />
    )
}
