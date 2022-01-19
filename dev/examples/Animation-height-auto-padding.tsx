import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export const App = () => {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <div className="example-container">
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div
                        animate={{
                            height: "auto",
                            opacity: 1,
                            paddingTop: 30,
                            paddingBottom: 30,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                        }}
                        initial={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                        }}
                        style={{ background: "white", width: 200 }}
                    >
                        Test
                    </motion.div>
                ) : null}
            </AnimatePresence>
            <button style={{}} onClick={() => setExpanded(!isExpanded)}>
                Toggle
            </button>
            <style>{styles}</style>
        </div>
    )
}

const styles = `body {
  background: white!important;
  background-repeat: no-repeat;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.example-container {
  width: 320px;
  padding: 20px;
}
}`
