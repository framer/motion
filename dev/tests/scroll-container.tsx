import { useScroll, motion, useMotionValueEvent } from "framer-motion"
import * as React from "react"
import { useRef } from "react"

export const App = () => {
    const containerRef = useRef(null)
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        container: containerRef,
        target: targetRef,
        offset: ["start start", "end start"],
    })

    useMotionValueEvent(scrollYProgress, "change", console.log)

    return (
        <>
            <div style={{ height: 100, width: 100 }}></div>
            <div
                id="container"
                ref={containerRef}
                style={{
                    overflowY: "auto",
                    height: 300,
                    width: 300,
                    position: "relative",
                }}
            >
                <div style={{ height: 1000, width: 300, background: "red" }}>
                    <div
                        ref={targetRef}
                        style={{
                            width: 100,
                            height: 100,
                            fontSize: 24,
                            display: "flex",
                            background: "white",
                        }}
                    >
                        <motion.span id="label">{scrollYProgress}</motion.span>
                    </div>
                </div>
            </div>
        </>
    )
}
