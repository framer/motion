import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react";

export const App = () => {
    const output = useRef<Array<string | number>>([])
    const ref = useRef<HTMLDivElement>(null)
    const [state, setState] = useState(true)

    return (
        <div style={{ height: 100, width: 200, display: "flex" }}>
            <AnimatePresence>
                {state ? (
                    <motion.div
                        id="test"
                        ref={ref}
                        animate={{ x: "100%", y: "100%", rotate: "-30deg" }}
                        style={{ width: 200, background: "red" }}
                        onClick={() => setState(false)}
                        transition={{ duration: 2 }}
                        onUpdate={({ x }) => {
                            output.current.push(x)
                        }}
                        onAnimationComplete={() => {
                            if (output.current[0] === "100%") {
                                ref.current!.innerHTML = "Error"
                            }
                        }}
                    />
                ) : null}
            </AnimatePresence>
        </div>
    )
}
