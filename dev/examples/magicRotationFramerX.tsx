import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, MagicMotion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <MagicMotion>
            <AnimatePresence>
                <motion.div
                    id="parent"
                    magicId="parent"
                    transition={{ duration: 1 }}
                    style={smallParent}
                    onClick={() => setIsOn(!isOn)}
                    key="a"
                >
                    <motion.div
                        magicId="child"
                        transition={{ duration: 1 }}
                        style={smallChild}
                    />
                </motion.div>
                {isOn && (
                    <motion.div
                        magicId="parent"
                        transition={{ duration: 1 }}
                        style={bigParent}
                        onClick={() => setIsOn(!isOn)}
                        key="b"
                    >
                        <motion.div
                            magicId="child"
                            transition={{ duration: 1 }}
                            style={bigChild}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </MagicMotion>
    )
}

const parent = {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}
const bigParent = {
    ...parent,
    width: 400,
    height: 400,
    borderRadius: 0,
    rotate: 45,
    justifyContent: "flex-start",
    alignItems: "flex-start",
}
const smallParent = {
    ...parent,
    width: 100,
    height: 100,
    borderRadius: 50,
    rotate: 10,
}

const child = {
    backgroundColor: "red",
}
const bigChild = {
    ...child,
    width: 100,
    height: 100,
    borderRadius: 20,
    rotate: 0,
}
const smallChild = {
    ...child,
    width: 50,
    height: 50,
    borderRadius: 0,
    rotate: 45,
}
