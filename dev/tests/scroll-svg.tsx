import * as React from "react"
import { useRef } from "react"
import { motion, useScroll } from "framer-motion"

export const App = () => {
    const rect = useRef(null)
    const svg = useRef(null)

    const rectValues = useScroll({
        target: rect,
        offset: ["start end", "end start"],
    })

    const svgValues = useScroll({
        target: svg,
        offset: ["start end", "end start"],
    })

    return (
        <>
            <div style={{ paddingTop: 400, paddingBottom: 400 }}>
                <svg ref={svg} viewBox="0 0 200 200" width="200" height="200">
                    <rect
                        ref={rect}
                        width="100"
                        height="100"
                        x="50"
                        y="50"
                        fill="red"
                    />
                </svg>
            </div>
            <motion.div style={{ ...fixed }} id="rect-progress">
                {rectValues.scrollYProgress}
            </motion.div>
            <motion.div style={{ ...fixed, top: 50 }} id="svg-progress">
                {svgValues.scrollYProgress}
            </motion.div>
        </>
    )
}

const fixed: React.CSSProperties = {
    position: "fixed",
    top: 10,
    left: 10,
}
