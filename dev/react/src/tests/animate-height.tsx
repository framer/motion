import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react";

export const App = () => {
    const output = useRef<Array<string | number>>([])
    const ref = useRef<HTMLDivElement>(null)
    const [state, setState] = useState(true)

    return (
        <div style={{ height: 100, width: 100, display: "flex" }}>
            <AnimatePresence>
                {state ? (
                    <motion.div
                        id="test"
                        ref={ref}
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        style={{ width: 100, background: "red" }}
                        transition={{ duration: 0.1 }}
                        onUpdate={({ height }) => {
                            output.current.push(height)
                        }}
                        onAnimationComplete={() => {
                            // Didn't animate properly
                            if (output.current.length === 1) {
                                ref.current!.innerHTML = "Error"
                            }

                            // Didn't apply "auto" as final style
                            requestAnimationFrame(() => {
                                if (ref.current?.style.height !== "auto") {
                                    ref.current!.innerHTML = "Error"
                                }
                            })
                        }}
                        onClick={() => setState(false)}
                    />
                ) : null}
            </AnimatePresence>
        </div>
    )
}
