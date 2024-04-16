import { animate } from "framer-motion"
import { useEffect, useRef } from "react"

/**
 * An example of animating between different value types
 */

export const App = () => {
    const ref = useRef(null)
    useEffect(() => {
        animate(
            ref.current,
            { width: [0, 100], rotate: [0, 45] },
            { duration: 0.1, ease: "linear" }
        ).then(() => {
            animate(
                ref.current,
                { width: "50%" },
                { duration: 0.1, ease: "linear" }
            )
        })
    }, [])

    return (
        <div
            ref={ref}
            style={{
                width: 100,
                height: 100,
                background: "#ffaa00",
            }}
            id="box"
        />
    )
}
