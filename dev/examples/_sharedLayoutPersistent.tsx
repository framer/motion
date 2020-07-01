import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, AnimateSharedLayout } from "@framer"

/**
 * This demo shows persistent shared element transitions. When the red box is clicked,
 * a new one is created with the same layoutId. The original box is hidden, but will appear
 * to move towards the position of the newly created box. When the new red box is hidden,
 * it will perform an exit animation towards the size and location of the old box. When
 * it is finally removed from the DOM, the original box is made visible.
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <div style={container} onClick={() => setIsOn(!isOn)}>
            <AnimateSharedLayout type="crossfade">
                <div style={outline}>
                    <motion.div
                        layoutId="box"
                        debugId="source"
                        id="source-box"
                        style={box}
                    />
                </div>

                <div style={{ ...outline, width: 400, height: 400 }}>
                    <AnimatePresence>
                        {isOn && (
                            <motion.div
                                debugId="overlay"
                                layoutId="box"
                                id="target-box"
                                style={{
                                    ...box,
                                    backgroundColor: "#ff0076",
                                    width: 400,
                                    height: 400,
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </AnimateSharedLayout>
        </div>
    )
}

const container = {
    width: 800,
    display: "flex",
    justifyContent: "space-between",
}

const box = {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 15,
}

const outline = {
    width: 200,
    height: 200,
    border: "5px dotted #ff0076",
    borderRadius: 20,
}
