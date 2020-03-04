import { motion, AnimatePresence, MagicMotion } from "@framer"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

const transition = { duration: 1 }

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setVisible(!isVisible)
        }, 1500)
    })

    return (
        <div>
            <MagicMotion>
                <motion.div
                    style={{
                        padding: 20,
                        background: "white",
                        width: 100,
                        marginTop: isVisible ? 0 : -100,
                    }}
                    layoutTransition
                >
                    <AnimatePresence
                        initial={false}
                        onRest={() => console.log("rest")}
                    >
                        {isVisible && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                style={style}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div layoutTransition style={style} />
            </MagicMotion>
        </div>
    )
}
