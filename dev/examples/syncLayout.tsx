import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"
import { UnstableSyncLayout } from "../../src/components/SyncLayout"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setVisible(!isVisible)
        }, 1500)
    })

    return (
        <div>
            <UnstableSyncLayout>
                <motion.div
                    style={{ padding: 20, background: "white", width: 100 }}
                    positionTransition
                >
                    <AnimatePresence
                        initial={false}
                        onRest={() => console.log("rest")}
                    >
                        {isVisible && (
                            <motion.div
                                key="a"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                style={style}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div positionTransition style={style} />
            </UnstableSyncLayout>
        </div>
    )
}
